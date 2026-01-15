# PWA Icon Setup Instructions

## Current Status
SVG icons have been created. For full PWA support, you need PNG versions.

## Quick Setup (Recommended)

### Option 1: Use Online Tool (Easiest)
1. Go to https://realfavicongenerator.net/
2. Upload `public/icon.svg`
3. Generate favicons and download
4. Place `android-chrome-192x192.png` as `icon-192.png`
5. Place `android-chrome-512x512.png` as `icon-512.png`

### Option 2: Use Design Tool
1. Open `public/icon.svg` in Figma/Canva/Photoshop
2. Export as PNG:
   - 192x192 pixels → `icon-192.png`
   - 512x512 pixels → `icon-512.png`
3. Place both files in `public/` directory

### Option 3: Use Command Line (if you have ImageMagick)
```bash
convert -background none -resize 192x192 public/icon.svg public/icon-192.png
convert -background none -resize 512x512 public/icon.svg public/icon-512.png
```

## Temporary Solution
The app will work with SVG icons, but PNG is recommended for better compatibility.

## Icon Design Tips
- Use your app's brand colors (#667eea, #764ba2)
- Include Tamil text "சொல்" or "Sollu"
- Keep it simple and recognizable at small sizes
- Ensure good contrast for visibility
