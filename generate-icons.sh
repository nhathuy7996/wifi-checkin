#!/bin/bash

# Script to generate icon files for Electron app
# Requires imagemagick: brew install imagemagick (macOS)

echo "Generating icons for Electron app..."

# Check if icon.png exists
if [ ! -f "icon.png" ]; then
    echo "Error: icon.png not found!"
    exit 1
fi

# Check if imagemagick is installed
if ! command -v magick &> /dev/null; then
    echo "ImageMagick is not installed!"
    echo "Install it with: brew install imagemagick"
    exit 1
fi

# Generate .ico for Windows (256x256)
# Make square image with transparent padding to avoid distortion
echo "Creating icon.ico for Windows..."
magick icon.png -gravity center -background transparent -extent 2048x2048 -resize 256x256 -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# Generate .icns for macOS
echo "Creating icon.icns for macOS..."
mkdir -p icon.iconset

# Create square versions with transparent padding
magick icon.png -gravity center -background transparent -extent 2048x2048 -resize 16x16 icon.iconset/icon_16x16.png
magick icon.png -gravity center -background transparent -extent 2048x2048 -resize 32x32 icon.iconset/icon_16x16@2x.png
magick icon.png -gravity center -background transparent -extent 2048x2048 -resize 32x32 icon.iconset/icon_32x32.png
magick icon.png -gravity center -background transparent -extent 2048x2048 -resize 64x64 icon.iconset/icon_32x32@2x.png
magick icon.png -gravity center -background transparent -extent 2048x2048 -resize 128x128 icon.iconset/icon_128x128.png
magick icon.png -gravity center -background transparent -extent 2048x2048 -resize 256x256 icon.iconset/icon_128x128@2x.png
magick icon.png -gravity center -background transparent -extent 2048x2048 -resize 256x256 icon.iconset/icon_256x256.png
magick icon.png -gravity center -background transparent -extent 2048x2048 -resize 512x512 icon.iconset/icon_256x256@2x.png
magick icon.png -gravity center -background transparent -extent 2048x2048 -resize 512x512 icon.iconset/icon_512x512.png
magick icon.png -gravity center -background transparent -extent 2048x2048 -resize 1024x1024 icon.iconset/icon_512x512@2x.png

if command -v iconutil &> /dev/null; then
    iconutil -c icns icon.iconset -o icon.icns
    rm -rf icon.iconset
    echo "✅ Icons generated successfully!"
    echo "  - icon.png (Linux)"
    echo "  - icon.ico (Windows)"
    echo "  - icon.icns (macOS)"
else
    echo "⚠️  iconutil not found (macOS only). Skipping .icns creation."
    echo "✅ Generated:"
    echo "  - icon.png (Linux)"
    echo "  - icon.ico (Windows)"
    rm -rf icon.iconset
fi
