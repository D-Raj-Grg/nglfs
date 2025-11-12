# Favicon Generation Instructions

This file contains instructions for generating PNG and ICO favicon files from the SVG source.

## Required Files to Generate

The following files need to be generated from `favicon.svg`:

1. **favicon.ico** - 32x32 ICO format (multi-resolution)
2. **favicon-16x16.png** - 16x16 PNG
3. **favicon-32x32.png** - 32x32 PNG
4. **apple-touch-icon.png** - 180x180 PNG
5. **icon-192.png** - 192x192 PNG (for PWA)
6. **icon-512.png** - 512x512 PNG (for PWA)

## Generation Methods

### Option 1: Using Online Tools (Easiest)

1. Visit https://realfavicongenerator.net/
2. Upload `favicon.svg`
3. Configure settings:
   - iOS: Use the gradient design, no background color
   - Android Chrome: Use the gradient design with #0A0A0A background
   - Windows Metro: Use the gradient design
   - macOS Safari: Use the gradient design
4. Download the generated package
5. Replace the files in the `public/` directory

### Option 2: Using ImageMagick (Command Line)

```bash
# Install ImageMagick if not already installed
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

cd public/

# Generate various PNG sizes
convert favicon.svg -resize 16x16 favicon-16x16.png
convert favicon.svg -resize 32x32 favicon-32x32.png
convert favicon.svg -resize 180x180 apple-touch-icon.png
convert favicon.svg -resize 192x192 icon-192.png
convert favicon.svg -resize 512x512 icon-512.png

# Generate ICO file (multi-resolution)
convert favicon.svg -define icon:auto-resize=64,48,32,16 favicon.ico
```

### Option 3: Using Sharp (Node.js)

Create a script `scripts/generate-favicons.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

const svgBuffer = fs.readFileSync('public/favicon.svg');

sizes.forEach(({ name, size }) => {
  sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`public/${name}`)
    .then(() => console.log(`Generated ${name}`))
    .catch(err => console.error(`Error generating ${name}:`, err));
});
```

Then run:
```bash
npm install sharp
node scripts/generate-favicons.js
```

## OG Image

You should also create an Open Graph image at `public/og-image.png` (1200x630):

1. Use Figma, Canva, or similar design tool
2. Create a 1200x630 canvas
3. Use the dark background (#0A0A0A)
4. Place the logo and "NGLFS - Anonymous Messaging Made Beautiful" text
5. Export as PNG
6. Save to `public/og-image.png`

## Verification

After generating the files, verify they exist:

```bash
ls -lh public/*.png public/*.ico public/*.svg
```

You should see:
- favicon.svg (already exists)
- favicon.ico
- favicon-16x16.png
- favicon-32x32.png
- apple-touch-icon.png
- icon-192.png
- icon-512.png
- og-image.png

## Testing

1. Clear browser cache
2. Visit http://localhost:3000
3. Check browser tab for favicon
4. Check mobile home screen icon (if PWA installed)
5. Test Open Graph preview using https://www.opengraph.xyz/
