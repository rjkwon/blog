# This is a copy of my Firebase poller script that lives on a Raspberry Pi in my studio. Copy stored in my site repo for reference.

import fcntl
import json
import os
import re
import sys
import textwrap
import time
import unicodedata
from contextlib import contextmanager
from datetime import datetime
from zoneinfo import ZoneInfo
import firebase_admin
from firebase_admin import credentials, firestore
from escpos.printer import Serial

# Initialize Firebase Admin
cred = credentials.Certificate('/home/kwon/guestbook/firebase-key.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

LOCAL_TZ = ZoneInfo('America/New_York')
MAX_ATTEMPTS = 3
MAX_PER_SESSION = 10

# Notes containing any of these (as whole words, ignoring case) are moved to the "guestbook_spam"
# collection in Firebase instead of printed, so you can check them there. Add words as spam shows up.
SPAM_WORDS = [
    'apk', 'casino', 'crypto', 'bitcoin', 'forex', 'betting', 'gambling',
    'viagra', 'cialis', 'porn', 'escort', 'backlink', 'backlinks', 'seo',
]

COUNTER_FILE = '/home/kwon/guestbook/ticket_count.txt'  # running ticket number (stays locally on Pi)
LOCK_FILE = '/home/kwon/guestbook/poller.lock'           # stops a second copy from running and double-printing
PRINT_LOCK_FILE = '/home/kwon/guestbook/printer.lock'    # lets --reprint wait its turn while the poller is printing
PRINTED_FILE = '/home/kwon/guestbook/printed.jsonl'      # local copy of recent tickets, for --reprint
KEEP_PRINTED = 50                                        # how many recent tickets to keep in PRINTED_FILE

failures = {}             # doc id -> failed print attempts this session

def read_count():
    try:
        with open(COUNTER_FILE) as f:
            return int(f.read().strip())
    except (FileNotFoundError, ValueError):
        return 0

def save_count(n):
    tmp = COUNTER_FILE + '.tmp'
    with open(tmp, 'w') as f:
        f.write(str(n))
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, COUNTER_FILE)

class PrinterOffline(Exception):
    pass

class OutOfPaper(PrinterOffline):
    # Like the printer being off: keep the note in the queue and wait, don't count it as a failure
    pass

LINE_WIDTH = 32  # characters per line at normal text size

# Phones swap in "smart" punctuation the printer can't show (I'm -> Ióm), so map it back to plain ASCII
SMART_PUNCTUATION = str.maketrans({
    '\u2018': "'", '\u2019': "'", '\u201a': "'", '\u2032': "'",
    '\u201c': '"', '\u201d': '"', '\u201e': '"', '\u2033': '"',
    '\u2013': '-', '\u2014': '-', '\u2212': '-',
    '\u2026': '...', '\u00a0': ' ', '\u2022': '*',
    # Invisible joiners/variation selectors inside emoji, so one emoji prints as one ? not several
    '\u200b': None, '\u200c': None, '\u200d': None, '\ufe0e': None, '\ufe0f': None,
})

def to_ascii(s):
    s = s.translate(SMART_PUNCTUATION)
    # Split accented letters into letter + accent (é -> e + ´) and drop the accent
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c) and not '\U0001F3FB' <= c <= '\U0001F3FF')
    # Anything still not ASCII (emoji, other scripts) prints as ?
    return s.encode('ascii', 'replace').decode('ascii')

def clean(s, max_len):
    # Strip control characters (ESC/POS commands) except newlines, collapse blank-line runs
    s = re.sub(r'[\x00-\x09\x0b-\x1f\x7f]', '', str(s))
    s = to_ascii(s)
    s = re.sub(r' {2,}', ' ', s)
    s = re.sub(r'\n{3,}', '\n\n', s)
    return s.strip()[:max_len]

def wrap(s, width=LINE_WIDTH):
    # Break lines between words instead of mid-word, keeping the writer's own line breaks
    return '\n'.join(
        '\n'.join(textwrap.wrap(line, width)) if line.strip() else ''
        for line in s.split('\n')
    )

def paper_status(p):
    # Asks the printer for its paper sensor (ESC/POS "DLE EOT 4"). Returns 'ok', 'low', 'out',
    # or 'unknown' if the printer doesn't answer (then paper-outs can't be detected).
    try:
        if getattr(p, 'device', None) is None:  # some python-escpos versions connect lazily
            p.open()
        p.device.reset_input_buffer()
        p.device.write(b'\x10\x04\x04')
        reply = p.device.read(1)
    except Exception:
        return 'unknown'
    if not reply:
        return 'unknown'
    if reply[0] & 0x60:
        return 'out'
    if reply[0] & 0x0C:
        return 'low'
    return 'ok'

warned_unknown_paper = False

def check_paper(p, when):
    global warned_unknown_paper
    status = paper_status(p)
    if status == 'out':
        raise OutOfPaper(f"printer is out of paper ({when} printing)")
    if status == 'low':
        print("Paper is running low.")
    if status == 'unknown' and not warned_unknown_paper:
        print("Printer didn't answer the paper check, so running out of paper can't be detected.")
        warned_unknown_paper = True

@contextmanager
def printer_lock():
    # Only one thing talks to the printer at a time (the poller, or a --reprint)
    with open(PRINT_LOCK_FILE, 'w') as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        yield

def save_printed(ticket):
    # Keep the last KEEP_PRINTED tickets on the Pi, so any of them can be reprinted later
    try:
        with open(PRINTED_FILE) as f:
            lines = f.read().splitlines()
    except FileNotFoundError:
        lines = []
    lines = (lines + [json.dumps(ticket)])[-KEEP_PRINTED:]
    tmp = PRINTED_FILE + '.tmp'
    with open(tmp, 'w') as f:
        f.write('\n'.join(lines) + '\n')
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, PRINTED_FILE)

def reprint(number):
    try:
        with open(PRINTED_FILE) as f:
            tickets = [json.loads(line) for line in f if line.strip()]
    except FileNotFoundError:
        tickets = []
    matches = [t for t in tickets if t['number'] == number]
    if not matches:
        kept = ', '.join(str(t['number']) for t in tickets) or 'none'
        print(f"Ticket #{number} isn't in {PRINTED_FILE}. Tickets kept: {kept}")
        sys.exit(1)
    t = matches[-1]
    print_ticket(t['number'], t['name'], t['contact'], t['message'], t['date'])
    print(f"Reprinted #{number} from {t['name']}.")

def print_ticket(number, name, contact, message, timestamp):
    with printer_lock():
        _print_ticket(number, name, contact, message, timestamp)

def _print_ticket(number, name, contact, message, timestamp):
    try:
        p = Serial(
            devfile='/dev/ttyUSB0',
            baudrate=19200,
            bytesize=8,
            parity='N',
            stopbits=1,
            timeout=1.0,
            dsrdtr=True
        )
    except Exception as e:
        # Printer unplugged or off: not the note's fault, so don't count it as a failure
        raise PrinterOffline(e)

    try:
        check_paper(p, "before")
        p.set(align='center', bold=True, double_height=True, double_width=True)
        p.text(f"GUEST #{number}\n")
        p.set(align='center', bold=False, normal_textsize=True)
        p.text(f"{timestamp}\n")
        p.text("-" * LINE_WIDTH + "\n\n")

        p.set(align='left', bold=True)
        p.text(wrap(f"From: {name}") + "\n")
        if contact:
            p.set(bold=False)
            p.text(wrap(f"Contact: {contact}") + "\n")
        p.text("\n")

        p.set(bold=False)
        p.text(wrap(message) + "\n\n")

        p.text("-" * LINE_WIDTH + "\n\n\n")
        p.cut()

        # If the paper ran out partway, the ticket is incomplete: don't treat it as printed.
        # (Give the printer a moment to finish feeding what it was sent first.)
        time.sleep(2)
        check_paper(p, "while")
    finally:
        p.close()

def format_time(created_at):
    if created_at and hasattr(created_at, 'astimezone'):
        return created_at.astimezone(LOCAL_TZ).strftime("%Y-%m-%d %H:%M")
    return datetime.now(LOCAL_TZ).strftime("%Y-%m-%d %H:%M")

def spam_word(*texts):
    # Returns the first SPAM_WORDS entry found in the note, or None
    text = ' '.join(texts).lower()
    for word in SPAM_WORDS:
        if re.search(r'\b' + re.escape(word.lower()) + r'\b', text):
            return word
    return None

def set_aside_spam(doc, data, word):
    # Not printed, not deleted outright: kept in guestbook_spam to check (and delete) in the Firebase console
    db.collection('guestbook_spam').document(doc.id).set({**data, 'matched': word})
    db.collection('guestbook').document(doc.id).delete()

def set_aside(doc, data, error):
    # Keep note for manual review instead of retrying (and wasting paper) forever
    db.collection('guestbook_failed').document(doc.id).set({**data, 'error': str(error)})
    db.collection('guestbook').document(doc.id).delete()
    failures.pop(doc.id, None)
    print(f"Moved document {doc.id} to guestbook_failed after {MAX_ATTEMPTS} failed prints.")

def poll_and_purge():
    print("Self-purging queue listener active. Waiting for entries...")
    printed = 0
    last_error = None
    while True:
        try:
            # Everything still in the collection is unprinted, since printed notes are deleted
            docs = (
                db.collection('guestbook')
                .order_by('createdAt')
                .limit(20)
                .stream()
            )

            for doc in docs:
                if printed >= MAX_PER_SESSION:
                    print(f"Printed {MAX_PER_SESSION} notes this session; pausing until next boot.")
                    while True:
                        time.sleep(3600)

                data = doc.to_dict()
                name = clean(data.get('name') or 'Anonymous', 50) or 'Anonymous'
                contact = clean(data.get('contact') or '', 100)
                msg = clean(data.get('message') or '', 400)
                time_str = format_time(data.get('createdAt'))

                word = spam_word(name, contact, msg)
                if word:
                    set_aside_spam(doc, data, word)
                    print(f"Skipped likely spam from {name} (matched '{word}'); moved to guestbook_spam.")
                    continue

                # Only a successful print uses up a number, so failed notes don't leave gaps
                number = read_count() + 1
                print(f"Printing #{number} from {name}...")
                try:
                    print_ticket(number, name, contact, msg, time_str)
                except PrinterOffline:
                    raise
                except Exception as e:
                    failures[doc.id] = failures.get(doc.id, 0) + 1
                    print(f"Print failed for {doc.id} (attempt {failures[doc.id]}): {e}")
                    if failures[doc.id] >= MAX_ATTEMPTS:
                        set_aside(doc, data, e)
                    continue

                try:
                    save_count(number)
                except Exception as e:
                    # Don't let a counter problem leave the note in the queue to print again
                    print(f"Couldn't save ticket count {number}: {e}")
                try:
                    save_printed({'number': number, 'date': time_str, 'name': name, 'contact': contact,
                                  'message': msg, 'printed_at': datetime.now(LOCAL_TZ).isoformat(timespec='seconds')})
                except Exception as e:
                    print(f"Couldn't save #{number} to {PRINTED_FILE}: {e}")
                print(f"Printed #{number} from {name}.")
                printed += 1
                failures.pop(doc.id, None)
                # Purge document from Firebase immediately
                db.collection('guestbook').document(doc.id).delete()
                print(f"Purged entry {doc.id} from Firebase.")
                time.sleep(1)

            last_error = None

        except Exception as e:
            # Network drops (hotspot disconnected) or printer offline: log once, then keep waiting
            if str(e) != last_error:
                print(f"Waiting: {type(e).__name__}: {e}")
                last_error = str(e)

        time.sleep(5)


if __name__ == "__main__":
    # Write log lines out immediately, even if the service runs Python without -u
    sys.stdout.reconfigure(line_buffering=True)

    # python firebase_poller.py --reprint 31: reprint a recent ticket from PRINTED_FILE.
    # Doesn't touch Firebase or the ticket counter, and can run while the poller is running.
    if len(sys.argv) == 3 and sys.argv[1] == '--reprint':
        reprint(int(sys.argv[2].lstrip('#')))
        sys.exit(0)

    lock = open(LOCK_FILE, 'w')
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        print("Another poller is already running; exiting so notes don't print twice.")
        sys.exit(1)
    poll_and_purge()
