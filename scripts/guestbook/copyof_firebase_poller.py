# This is a copy of my Firebase poller script that lives on a Raspberry Pi in my studio. Copy stored in my site repo for reference.

import os
import re
import time
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
MAX_ATTEMPTS = 3          # move a note aside after this many failed prints
MAX_PER_SESSION = 10      # backstop against spam: stop printing after this many tickets per boot

COUNTER_FILE = '/home/kwon/guestbook/ticket_count.txt'  # running ticket number, stays on the Pi

failures = {}             # doc id -> failed print attempts this session

def read_count():
    try:
        with open(COUNTER_FILE) as f:
            return int(f.read().strip())
    except (FileNotFoundError, ValueError):
        return 0

def save_count(n):
    # Write to a temp file and rename, so a power cut mid-write can't corrupt the count
    tmp = COUNTER_FILE + '.tmp'
    with open(tmp, 'w') as f:
        f.write(str(n))
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, COUNTER_FILE)

class PrinterOffline(Exception):
    pass

def clean(s, max_len):
    # Strip control characters (ESC/POS commands) except newlines, collapse blank-line runs
    s = re.sub(r'[\x00-\x09\x0b-\x1f\x7f]', '', str(s))
    s = re.sub(r'\n{3,}', '\n\n', s)
    return s.strip()[:max_len]

def print_ticket(number, name, contact, message, timestamp):
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
        p.set(align='center', bold=True, double_height=True, double_width=True)
        p.text(f"GUESTBOOK #{number}\n")
        p.set(align='center', normal_textsize=True)
        p.text(f"{timestamp}\n")
        p.text("-" * 32 + "\n\n")

        p.set(align='left', bold=True)
        p.text(f"From: {name}\n")
        if contact:
            p.set(bold=False)
            p.text(f"Contact: {contact}\n")
        p.text("\n")

        p.set(bold=False)
        p.text(f"{message}\n\n")

        p.text("-" * 32 + "\n\n\n")
        p.cut()
    finally:
        p.close()

def format_time(created_at):
    if created_at and hasattr(created_at, 'astimezone'):
        return created_at.astimezone(LOCAL_TZ).strftime("%Y-%m-%d %H:%M")
    return datetime.now(LOCAL_TZ).strftime("%Y-%m-%d %H:%M")

def set_aside(doc, data, error):
    # Keep the note for manual review instead of retrying (and wasting paper) forever
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

                print(f"Printing note from {name}...")
                try:
                    # Only a successful print uses up a number, so failed notes don't leave gaps
                    number = read_count() + 1
                    print_ticket(number, name, contact, msg, time_str)
                except PrinterOffline:
                    raise
                except Exception as e:
                    failures[doc.id] = failures.get(doc.id, 0) + 1
                    print(f"Print failed for {doc.id} (attempt {failures[doc.id]}): {e}")
                    if failures[doc.id] >= MAX_ATTEMPTS:
                        set_aside(doc, data, e)
                    continue

                save_count(number)
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
    poll_and_purge()
