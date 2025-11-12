#!/bin/bash

# NGLFS Favicon Generator Script
# Requires ImageMagick: brew install imagemagick

set -e

echo "🎨 NGLFS Favicon Generator"
echo "=========================="
echo ""

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick is not installed"
    echo "   Install with: brew install imagemagick"
    exit 1
fi

# Navigate to public directory
cd "$(dirname "$0")/../public" || exit 1

echo "📁 Working directory: $(pwd)"
echo ""

# Check if favicon.svg exists
if [ ! -f "favicon.svg" ]; then
    echo "❌ Error: favicon.svg not found"
    exit 1
fi

echo "Generating PNG favicons from favicon.svg..."
echo ""

# Generate various PNG sizes
echo "  Generating favicon-16x16.png..."
convert favicon.svg -resize 16x16 -background none favicon-16x16.png

echo "  Generating favicon-32x32.png..."
convert favicon.svg -resize 32x32 -background none favicon-32x32.png

echo "  Generating apple-touch-icon.png..."
convert favicon.svg -resize 180x180 -background none apple-touch-icon.png

echo "  Generating icon-192.png..."
convert favicon.svg -resize 192x192 -background none icon-192.png

echo "  Generating icon-512.png..."
convert favicon.svg -resize 512x512 -background none icon-512.png

# Generate ICO file (multi-resolution)
echo "  Generating favicon.ico..."
convert favicon.svg -define icon:auto-resize=64,48,32,16 -background none favicon.ico

echo ""
echo "✅ Success! Generated files:"
echo ""
ls -lh favicon-16x16.png favicon-32x32.png apple-touch-icon.png icon-192.png icon-512.png favicon.ico 2>/dev/null || true

echo ""
echo "📝 Next steps:"
echo "   1. Create OG image (1200x630) at og-image.png"
echo "   2. Test favicons in browser: http://localhost:3000"
echo "   3. Clear browser cache if needed"
echo ""
echo "🎉 Done!"
