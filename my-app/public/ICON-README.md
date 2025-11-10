# Fly Icon Setup

## Current Status
- ✅ SVG icon created: `public/fly-icon.svg`
- ✅ Favicon configured in `app/layout.tsx`
- ⚠️ PNG icons need to be generated

## To Generate PNG Icons

### Option 1: Use the HTML Generator (Easiest)
1. Open `public/generate-icons.html` in your browser
2. Click the buttons to download:
   - `fly-icon.png` (512x512) - for general favicon
   - `apple-touch-icon.png` (180x180) - for iOS home screen
3. Save the downloaded files to `public/` directory

### Option 2: Online Converter
1. Go to https://convertio.co/svg-png/ or https://cloudconvert.com/svg-to-png
2. Upload `public/fly-icon.svg`
3. Convert to PNG at:
   - 512x512px → save as `public/fly-icon.png`
   - 180x180px → save as `public/apple-touch-icon.png`

### Option 3: Using ImageMagick (if installed)
```bash
convert -background none -resize 512x512 public/fly-icon.svg public/fly-icon.png
convert -background none -resize 180x180 public/fly-icon.svg public/apple-touch-icon.png
```

## Icon Features
- Fly fishing fly with hook, body, wings, and tail
- Brand colors: Sky blue (#0ea5e9) and teal (#14b8a6)
- Works as favicon and mobile app icon

