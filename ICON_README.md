# Hướng dẫn sử dụng Icon

## Các file icon trong project

- **icon.png** - Icon gốc (dùng cho Linux và trong ứng dụng)
- **icon.ico** - Icon cho Windows (256x256, tự động resize cho nhiều kích thước)
- **icon.icns** - Icon cho macOS (chứa nhiều kích thước từ 16x16 đến 1024x1024)

## Cách tạo icon mới

Nếu bạn muốn thay đổi icon của ứng dụng:

1. Thay thế file `icon.png` bằng ảnh mới của bạn (khuyến nghị: 1024x1024px hoặc lớn hơn)
2. Chạy script để tạo lại các định dạng icon:
   ```bash
   ./generate-icons.sh
   ```

Script này sẽ tự động:
- Tạo file `.ico` cho Windows (với nhiều kích thước: 256, 128, 64, 48, 32, 16)
- Tạo file `.icns` cho macOS (với tất cả kích thước cần thiết)
- Tự động thêm padding để icon không bị méo

## Yêu cầu

- **macOS**: `imagemagick` (cài đặt: `brew install imagemagick`)
- **Linux**: `imagemagick` (cài đặt: `sudo apt install imagemagick` hoặc `sudo yum install imagemagick`)
- **Windows**: Tải ImageMagick từ https://imagemagick.org/script/download.php

## Build ứng dụng với icon

Sau khi tạo xong các file icon, build ứng dụng:

```bash
# Build cho tất cả nền tảng
npm run dist:all

# Hoặc build cho từng nền tảng cụ thể
npm run dist:mac    # macOS
npm run dist:win    # Windows
npm run dist:linux  # Linux
```

Ứng dụng sẽ tự động sử dụng đúng icon cho từng nền tảng.
