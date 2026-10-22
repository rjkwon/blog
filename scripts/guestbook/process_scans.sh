#!/bin/bash

# Turns scanned guestbook ticket PDFs into one image per ticket.
# See process_scans.swift for what it does to each page.
#
# Input: the Guestbook folder in iCloud Drive (PDFs can hold any number of tickets)
# Output: content/guestbook/tickets/ticket-###.webp, plus each ticket's text in data/guestbook_tickets.json
#
# Usage: npm run guestbook:scans            (skips tickets that already have an image)
#        npm run guestbook:scans -- --force (redo them all)
#        npm run guestbook:scans -- --show-contact 25 (show a contact line that isn't clearly a URL)

set -e

if ! command -v magick &> /dev/null; then
    echo "Error: ImageMagick is not installed (needed for WebP)."
    echo "Install with: brew install imagemagick"
    exit 1
fi

INPUT_DIR="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Guestbook"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${SCRIPT_DIR}/../../content/guestbook/tickets"
DATA_FILE="${SCRIPT_DIR}/../../data/guestbook_tickets.json"

if [ ! -d "$INPUT_DIR" ]; then
    echo "Error: iCloud Drive folder not found: $INPUT_DIR"
    exit 1
fi

# Compile the Swift script, only when it has changed since the last run
BIN_DIR="${TMPDIR:-/tmp}/kwon-guestbook"
BIN="${BIN_DIR}/process_scans"
mkdir -p "$BIN_DIR"
if [ ! -x "$BIN" ] || [ "${SCRIPT_DIR}/process_scans.swift" -nt "$BIN" ]; then
    echo "Compiling process_scans.swift..."
    swiftc -O "${SCRIPT_DIR}/process_scans.swift" -o "$BIN"
fi

# Convert png to webp
STAGING_DIR="$(mktemp -d)"
trap 'rm -rf "$STAGING_DIR"' EXIT

"$BIN" "$INPUT_DIR" "$OUTPUT_DIR" "$STAGING_DIR" "$DATA_FILE" "$@"

for png in "$STAGING_DIR"/*.png; do
    [ -e "$png" ] || continue
    name="$(basename "$png" .png)"
    magick "$png" -quality 80 -define webp:method=6 "${OUTPUT_DIR}/${name}.webp"
done
