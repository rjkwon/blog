#!/bin/bash

# Usage: ./process_photo.sh static/cans/<FILENAME>.jpg static/cans
#
# Processes an image (HEIC, RAW, JPG, etc.) by:
# 1. Resizing to 1500px on the long edge
# 2. Converting to JPG with no compression (quality 100)
# 3. Renaming based on the original capture date in format: YYYY-MM-DD_HH-MM-SS.jpg
# 4. Removing GPS/location data

set -e  # Exit on error

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is not installed."
    echo "Install with: brew install imagemagick (macOS) or apt-get install imagemagick (Linux)"
    exit 1
fi

# Check if exiftool is installed
if ! command -v exiftool &> /dev/null; then
    echo "Error: exiftool is not installed."
    echo "Install with: brew install exiftool (macOS) or apt-get install libimage-exiftool-perl (Linux)"
    exit 1
fi

# Check arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <input_file> [output_directory]"
    echo "Example: $0 IMG_1234.HEIC ./static/cans/"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_DIR="${2:-.}"  # Default to current directory if not specified

# Verify input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' not found."
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Extract the capture date from EXIF data
echo "Extracting capture date from $INPUT_FILE..."

# Try different EXIF date fields in order of preference
CAPTURE_DATE=$(exiftool -s -s -s -d "%Y-%m-%d_%H-%M-%S" -DateTimeOriginal "$INPUT_FILE" 2>/dev/null)

if [ -z "$CAPTURE_DATE" ]; then
    CAPTURE_DATE=$(exiftool -s -s -s -d "%Y-%m-%d_%H-%M-%S" -CreateDate "$INPUT_FILE" 2>/dev/null)
fi

if [ -z "$CAPTURE_DATE" ]; then
    CAPTURE_DATE=$(exiftool -s -s -s -d "%Y-%m-%d_%H-%M-%S" -ModifyDate "$INPUT_FILE" 2>/dev/null)
fi

if [ -z "$CAPTURE_DATE" ]; then
    echo "Error: Could not extract capture date from EXIF data."
    echo "Available EXIF date fields:"
    exiftool -time:all "$INPUT_FILE"
    exit 1
fi

OUTPUT_FILE="${OUTPUT_DIR}/${CAPTURE_DATE}.jpg"

echo "Processing image..."
echo "  Input: $INPUT_FILE"
echo "  Output: $OUTPUT_FILE"
echo "  Capture date: $CAPTURE_DATE"

# Process the image with ImageMagick
# - Resize to 1500px on longest edge (> means only if larger)
# - Quality 100 = no compression
# - Auto-orient based on EXIF orientation
if command -v magick &> /dev/null; then
    # ImageMagick 7+
    magick "$INPUT_FILE" -auto-orient -resize "1500x1500>" -quality 100 "$OUTPUT_FILE"
else
    # ImageMagick 6
    convert "$INPUT_FILE" -auto-orient -resize "1500x1500>" -quality 100 "$OUTPUT_FILE"
fi

# Remove GPS/location data from the output file
echo "Removing location data..."
exiftool -gps:all= -overwrite_original "$OUTPUT_FILE"

echo "✓ Image processed successfully!"
echo "  Saved to: $OUTPUT_FILE"

# Show file size
FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
echo "  File size: $FILE_SIZE"