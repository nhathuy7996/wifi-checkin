#!/bin/bash

echo "🚀 WiFi Telegram Checker - Starting..."
echo ""

# Check if X server is running
if [ -z "$DISPLAY" ]; then
    echo "❌ DISPLAY variable not set!"
    echo "   Bạn cần chạy trên môi trường có GUI (X11/Wayland)"
    echo ""
    echo "   Nếu đang dùng SSH, thử:"
    echo "   export DISPLAY=:0"
    echo ""
    exit 1
fi

echo "✅ Display: $DISPLAY"
echo ""

# Build
echo "📦 Building..."
npm run build > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    npm run build
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Run
echo "🎯 Starting Electron app..."
echo "   Cửa sổ sẽ mở trong giây lát..."
echo ""
echo "   👉 Nếu không thấy cửa sổ, nhấn Alt+Tab để tìm"
echo ""

electron .

echo ""
echo "App đã đóng."
