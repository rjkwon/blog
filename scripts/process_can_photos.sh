#!/bin/bash

# Batch-processes all images in a selected folder by:
# 1. Resizing to 1500px on the long edge
# 2. Converting to JPG with no compression (quality 100)
# 3. Renaming based on the original capture date in format: YYYY-MM-DD_HH-MM-SS.jpg
# 4. Removing GPS/location data
#
# Output goes to static/cans/ relative to this script's repo root.

set -e

# Check dependencies
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed."
    echo "Install with: brew install imagemagick"
    exit 1
fi

if ! command -v exiftool &> /dev/null; then
    echo "Error: exiftool is not installed."
    echo "Install with: brew install exiftool"
    exit 1
fi

# Prompt for input folder via macOS folder picker
INPUT_DIR=$(osascript -e 'tell app "Finder" to POSIX path of (choose folder with prompt "Select the folder of can photos to process:")')

if [ -z "$INPUT_DIR" ]; then
    echo "No folder selected. Exiting."
    exit 1
fi

# Strip trailing slash
INPUT_DIR="${INPUT_DIR%/}"
echo "Selected folder: $INPUT_DIR"

# Output directory is always static/cans relative to the repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${SCRIPT_DIR}/../static/cans"
mkdir -p "$OUTPUT_DIR"
echo "Output folder:  $OUTPUT_DIR"
echo ""

# Collect image files
IMAGES=()
while IFS= read -r -d '' f; do
    IMAGES+=("$f")
done < <(find "$INPUT_DIR" -maxdepth 1 -type f \( \
    -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.heic" \
    -o -iname "*.png" -o -iname "*.tiff" -o -iname "*.tif" \
    -o -iname "*.raw" -o -iname "*.dng" -o -iname "*.cr2" \
    -o -iname "*.nef" -o -iname "*.arw" \
\) -print0 | sort -z)

TOTAL=${#IMAGES[@]}

if [ "$TOTAL" -eq 0 ]; then
    echo "No image files found in '$INPUT_DIR'."
    exit 1
fi

echo "Found $TOTAL image(s) to process."
echo "----------------------------------------"

SUCCESS=0
SKIP=0
FAIL=0

for INPUT_FILE in "${IMAGES[@]}"; do
    FILENAME=$(basename "$INPUT_FILE")
    echo "Processing: $FILENAME"

    # Try EXIF date fields in order of preference
    CAPTURE_DATE=$(exiftool -s -s -s -d "%Y-%m-%d_%H-%M-%S" -DateTimeOriginal "$INPUT_FILE" 2>/dev/null)
    [ -z "$CAPTURE_DATE" ] && CAPTURE_DATE=$(exiftool -s -s -s -d "%Y-%m-%d_%H-%M-%S" -CreateDate "$INPUT_FILE" 2>/dev/null)
    [ -z "$CAPTURE_DATE" ] && CAPTURE_DATE=$(exiftool -s -s -s -d "%Y-%m-%d_%H-%M-%S" -ModifyDate "$INPUT_FILE" 2>/dev/null)

    if [ -z "$CAPTURE_DATE" ]; then
        echo "  ✗ Skipped — could not extract capture date from EXIF"
        (( SKIP++ )) || true
        continue
    fi

    OUTPUT_FILE="${OUTPUT_DIR}/${CAPTURE_DATE}.jpg"

    if [ -f "$OUTPUT_FILE" ]; then
        echo "  ✗ Skipped — output already exists: $CAPTURE_DATE.jpg"
        (( SKIP++ )) || true
        continue
    fi

    # DNG/RAW files need sips to decode first; ImageMagick can't read them natively
    EXT="${FILENAME##*.}"
    MAGICK_INPUT="$INPUT_FILE"
    TEMP_FILE=""
    if [[ "$(echo "$EXT" | tr '[:upper:]' '[:lower:]')" =~ ^(dng|raw|cr2|nef|arw)$ ]]; then
        TEMP_FILE=$(mktemp /tmp/can_photo_XXXXXX.tiff)
        sips -s format tiff "$INPUT_FILE" --out "$TEMP_FILE" &>/dev/null
        MAGICK_INPUT="$TEMP_FILE"
    fi

    if command -v magick &> /dev/null; then
        magick "$MAGICK_INPUT" -auto-orient -resize "1500x1500>" -quality 100 "$OUTPUT_FILE"
    else
        convert "$MAGICK_INPUT" -auto-orient -resize "1500x1500>" -quality 100 "$OUTPUT_FILE"
    fi

    [ -n "$TEMP_FILE" ] && rm -f "$TEMP_FILE"

    exiftool -gps:all= -overwrite_original "$OUTPUT_FILE" &>/dev/null

    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "  ✓ Saved as $CAPTURE_DATE.jpg ($FILE_SIZE)"
    (( SUCCESS++ )) || true
done

echo "----------------------------------------"
echo "Done. $SUCCESS processed, $SKIP skipped, $FAIL failed."
