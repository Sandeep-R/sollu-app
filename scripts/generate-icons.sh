#!/bin/bash

# Generate PWA icons from SVG
# Requires: sips (built into macOS) or ImageMagick

SVG_FILE="public/icon.svg"
OUTPUT_DIR="public"

echo "Generating PWA icons..."

# Check if SVG exists
if [ ! -f "$SVG_FILE" ]; then
    echo "Error: $SVG_FILE not found"
    exit 1
fi

# Create a temporary PNG from SVG (using sips or convert)
if command -v convert &> /dev/null; then
    # ImageMagick
    convert -background none -resize 192x192 "$SVG_FILE" "$OUTPUT_DIR/icon-192.png"
    convert -background none -resize 512x512 "$SVG_FILE" "$OUTPUT_DIR/icon-512.png"
    echo "Icons generated using ImageMagick"
elif command -v sips &> /dev/null; then
    # macOS sips (requires SVG to be converted first)
    # For now, create simple colored squares as placeholders
    # You can replace these with actual icons later
    sips -z 192 192 --setProperty format png --out "$OUTPUT_DIR/icon-192.png" /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns 2>/dev/null || \
    echo "Note: Please create icon-192.png (192x192) and icon-512.png (512x512) manually"
    echo "You can use online tools like: https://realfavicongenerator.net/"
    echo "Or design tools like Figma, Canva, etc."
else
    echo "No image converter found. Please create icons manually:"
    echo "  - $OUTPUT_DIR/icon-192.png (192x192 pixels)"
    echo "  - $OUTPUT_DIR/icon-512.png (512x512 pixels)"
fi

echo "Done!"
