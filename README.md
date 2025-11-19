# WiFi Telegram Checker

Ứng dụng Electron tự động gửi thông báo đến Telegram bot khi máy tính kết nối đến WiFi xác định.

## ✨ Tính năng

- ✅ Kiểm tra kết nối WiFi theo tên (SSID)
- ✅ Tự động gửi thông báo đến Telegram khi kết nối thành công
- ✅ Giao diện đơn giản, dễ sử dụng
- ✅ Cấu hình linh hoạt: WiFi name, bot token, chat ID, thời gian kiểm tra
- ✅ Test kết nối Telegram trước khi sử dụng

## 📋 Yêu cầu hệ thống

- **Linux**: Ubuntu/Debian với NetworkManager
- **Node.js**: v18 trở lên (cho development)
- **Telegram Bot**: Token và Chat ID

## 🚀 Cài đặt

### Từ source code

```bash
# Clone repository
git clone https://github.com/nhathuy7996/wifi-checkin.git
cd wifi-checkin

# Cài đặt dependencies
npm install

# Chạy ứng dụng
./start.sh
# hoặc
npm start
```

### Từ file build

**AppImage:**
```bash
chmod +x WiFi-Telegram-Checker-1.0.0.AppImage
./WiFi-Telegram-Checker-1.0.0.AppImage
```

**DEB Package:**
```bash
sudo dpkg -i wifi-telegram-checker_1.0.0_amd64.deb
```

## 🔧 Cấu hình Telegram Bot

### 1. Tạo Bot

1. Mở Telegram, tìm `@BotFather`
2. Gửi `/newbot`
3. Đặt tên cho bot (VD: "WiFi Checker Bot")
4. Đặt username (phải kết thúc bằng "bot", VD: "mywifi_checker_bot")
5. Lưu lại **Bot Token** (dạng: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Lấy Chat ID

**Cách 1: Dùng bot hỗ trợ**
- Tìm `@userinfobot` trên Telegram
- Gửi tin nhắn bất kỳ
- Bot trả lại Chat ID của bạn

**Cách 2: Dùng API**
1. Gửi tin nhắn đến bot của bạn
2. Mở browser: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Tìm `"chat":{"id":123456789}` - đó là Chat ID

## 📱 Sử dụng

### 1. Khởi động ứng dụng

```bash
./start.sh
```

### 2. Cấu hình

Trong giao diện ứng dụng:

1. **Tên WiFi (SSID)**: Nhập chính xác tên WiFi cần theo dõi
   - Kiểm tra tên WiFi hiện tại: `nmcli dev wifi | grep '*'`

2. **Telegram Bot Token**: Paste token từ BotFather

3. **Telegram Chat ID**: Paste ID từ userinfobot

4. **Khoảng thời gian kiểm tra**: Số giây giữa các lần kiểm tra (mặc định: 30)

### 3. Test và bắt đầu

1. Nhấn **"💾 Lưu cấu hình"**
2. Nhấn **"🔔 Test Telegram"** để kiểm tra kết nối
3. Nhấn **"▶️ Bắt đầu"** để theo dõi WiFi

## 🛠️ Development

### Cấu trúc project

```
.
├── src/
│   ├── main.ts           # Main process
│   ├── wifi-checker.ts   # Module kiểm tra WiFi
│   ├── telegram.ts       # Module Telegram
│   ├── renderer.html     # Giao diện UI
│   └── renderer.ts       # Logic UI
├── dist/                 # Build output
├── release/              # Executable files
├── package.json
├── tsconfig.json
└── start.sh
```

### Scripts

```bash
npm run build       # Build TypeScript
npm run dev         # Development mode
npm start           # Build và chạy
npm run dist:linux  # Build executable cho Linux
```

### Build executable

```bash
# Build cho Linux
npm run dist:linux

# Output: release/WiFi-Telegram-Checker-1.0.0.AppImage
#         release/wifi-telegram-checker_1.0.0_amd64.deb
```

## ❓ Troubleshooting

### Không phát hiện được WiFi

```bash
# Kiểm tra NetworkManager
which nmcli

# Nếu không có, cài đặt
sudo apt install network-manager
sudo systemctl restart NetworkManager

# Kiểm tra WiFi hiện tại
nmcli dev wifi | grep '*'
```

### Không gửi được Telegram

- Kiểm tra Bot Token và Chat ID có đúng không
- Đảm bảo đã gửi ít nhất 1 tin nhắn cho bot trước
- Kiểm tra kết nối internet
- Test bằng browser: `https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>&text=Test`

### Cửa sổ không hiển thị

```bash
# Kiểm tra DISPLAY
echo $DISPLAY

# Nếu rỗng
export DISPLAY=:0

# Chạy lại
./start.sh
```

## 📝 Lưu ý

- Ứng dụng chỉ gửi thông báo khi **trạng thái thay đổi** từ "chưa kết nối" sang "đã kết nối"
- Tên WiFi phải chính xác (phân biệt hoa thường)
- Cấu hình được lưu tại: `~/.config/wifi-telegram-checker/config.json`
- Hiện tại chỉ hỗ trợ Linux với NetworkManager

## 📄 License

MIT

## 👤 Author

GameDevToi

## 🤝 Contributing

Contributions, issues và feature requests đều được chào đón!

## ⭐ Support

Nếu project này hữu ích, hãy cho nó một star ⭐️
