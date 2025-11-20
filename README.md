# WiFi Telegram Checker

Ứng dụng Electron tự động gửi thông báo đến Telegram bot khi máy tính kết nối đến WiFi xác định.

## ✨ Tính năng

- ✅ Kiểm tra kết nối WiFi theo tên (SSID)
- ✅ Tự động gửi thông báo đến Telegram khi kết nối thành công
- ✅ Giao diện đơn giản, dễ sử dụng
- ✅ Cấu hình linh hoạt: WiFi name, bot token, chat ID, thời gian kiểm tra
- ✅ Test kết nối Telegram trước khi sử dụng
- ✅ **Hỗ trợ 2 chế độ Bot Token:**
  - Dùng bot token mặc định từ file `.env` (dành cho admin)
  - Dùng custom bot token riêng (dành cho từng user)
- 🖥️ **Backend API**: REST API để gửi tin nhắn Telegram từ xa
- 🤖 **Telegram Bot**: Tự động khởi động bot khi server chạy

## 📋 Yêu cầu hệ thống

### Desktop App
- **macOS**: macOS 10.13+ (High Sierra trở lên)
- **Linux**: Ubuntu/Debian với NetworkManager
- **Node.js**: v18 trở lên (cho development)

### Backend Server
- **Node.js**: v14 trở lên (yêu cầu hỗ trợ optional chaining)
- **PM2**: (khuyến nghị) để quản lý process
- **Telegram Bot**: Token và Chat ID

## 🚀 Cài đặt

### Desktop App - Từ source code

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

### Desktop App - Từ file build

**macOS:**
```bash
# Mở file .dmg và kéo app vào Applications
# hoặc giải nén file .zip và chạy
```

**Linux - AppImage:**
```bash
chmod +x WiFi-Telegram-Checker-1.0.0.AppImage
./WiFi-Telegram-Checker-1.0.0.AppImage
```

**Linux - DEB Package:**
```bash
sudo dpkg -i wifi-telegram-checker_1.0.0_amd64.deb
```

### Backend Server

```bash
# Di chuyển vào thư mục BE
cd BE

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env
nano .env  # Thêm TELEGRAM_BOT_TOKEN

# Khởi động server
npm start

# Hoặc dùng PM2 (khuyến nghị)
pm2 start src/index.js --name wifi-checker-backend
pm2 save
pm2 startup
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

### 1. Cấu hình Bot Token (Quan trọng!)

**Có 2 cách sử dụng bot token:**

#### Cách 1: Dùng Bot Token mặc định (từ .env) - Khuyên dùng cho admin

1. Copy file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```

2. Mở file `.env` và thêm bot token:
   ```env
   DEFAULT_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

3. Trong giao diện app: **KHÔNG** chọn checkbox "Sử dụng Telegram Bot riêng"

#### Cách 2: Dùng Custom Bot Token - Dành cho từng user

1. Trong giao diện app: **CHỌN** checkbox "Sử dụng Telegram Bot riêng"
2. Nhập bot token của riêng bạn vào input field

📖 Xem chi tiết: [BOT_TOKEN_GUIDE.md](./BOT_TOKEN_GUIDE.md)

### 2. Khởi động ứng dụng

```bash
./start.sh
# hoặc
npm start
```

### 3. Cấu hình trong giao diện

1. **Tên WiFi (SSID)**: Nhập chính xác tên WiFi cần theo dõi
   - Kiểm tra tên WiFi hiện tại: `nmcli dev wifi | grep '*'`

2. **Sử dụng Telegram Bot riêng**: Chọn nếu muốn dùng bot riêng (không dùng .env)

3. **Telegram Bot Token**: Chỉ hiện khi chọn "Use Custom Bot"

4. **Telegram Chat ID**: Paste ID từ userinfobot

5. **Khoảng thời gian kiểm tra**: Số giây giữa các lần kiểm tra (mặc định: 30)

### 4. Test và bắt đầu

1. Nhấn **"💾 Lưu cấu hình"**
2. Nhấn **"🔔 Test Telegram"** để kiểm tra kết nối
3. Nhấn **"▶️ Bắt đầu"** để theo dõi WiFi

## 🖥️ Backend API

Backend cung cấp REST API và Telegram bot tự động khởi động.

### API Endpoints

**POST /api/telegram/send**
```json
{
  "chatId": "123456789",
  "message": "Hello from API"
}
```

**POST /api/telegram/wifi-connected**
```json
{
  "chatId": "123456789",
  "ssid": "WiFi_Name"
}
```

**GET /api/telegram/status**
```json
{
  "status": "active",
  "botUsername": "your_bot"
}
```

### Bot Commands

- `/start` - Welcome và lấy Chat ID
- `/chatid` - Hiển thị Chat ID của bạn
- `/help` - Danh sách lệnh

### Deploy Backend

```bash
# Upload code lên server
npm run up  # (trong thư mục BE)

# SSH vào server và chạy
ssh your-server
cd CODE/wifi_checker/BE
npm install
pm2 start src/index.js --name wifi-checker-backend
pm2 save
```

## 🛠️ Development

### Cấu trúc project

```
.
├── src/                  # Desktop app source
│   ├── main.ts           # Main process
│   ├── wifi-checker.ts   # Module kiểm tra WiFi
│   ├── telegram.ts       # Module Telegram
│   ├── renderer.html     # Giao diện UI
│   └── renderer.ts       # Logic UI
├── BE/                   # Backend API
│   ├── src/
│   │   ├── index.js      # Server entry point
│   │   ├── routes/       # API routes
│   │   └── services/     # Telegram service
│   └── package.json
├── dist/                 # Build output
├── release/              # Executable files
├── build/                # Build configs
├── package.json
├── tsconfig.json
└── start.sh
```

### Scripts - Desktop App

```bash
npm run build        # Build TypeScript
npm run dev          # Development mode
npm start            # Build và chạy
npm run dist:mac     # Build cho macOS
npm run dist:linux   # Build cho Linux
npm run dist:win     # Build cho Windows
npm run dist:all     # Build cho tất cả platforms
```

### Scripts - Backend

```bash
npm start            # Khởi động server
npm run dev          # Development với nodemon
npm test             # Test API
npm run up           # Deploy lên server
```

### Build executable

```bash
# Build cho macOS (cần chạy trên macOS)
npm run dist:mac
# Output: release/WiFi-Telegram-Checker-1.0.0-universal.dmg

# Build cho Linux
npm run dist:linux
# Output: release/WiFi-Telegram-Checker-1.0.0.AppImage
#         release/wifi-telegram-checker_1.0.0_amd64.deb

# Build cho Windows (cần chạy trên Windows)
npm run dist:win
```

## ❓ Troubleshooting

### Desktop App

#### Không phát hiện được WiFi (Linux)

```bash
# Kiểm tra NetworkManager
which nmcli

# Nếu không có, cài đặt
sudo apt install network-manager
sudo systemctl restart NetworkManager

# Kiểm tra WiFi hiện tại
nmcli dev wifi | grep '*'
```

#### Không phát hiện được WiFi (macOS)

```bash
# Kiểm tra WiFi hiện tại
/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | grep ' SSID'
```

#### Không gửi được Telegram

- Kiểm tra Bot Token và Chat ID có đúng không
- Đảm bảo đã gửi ít nhất 1 tin nhắn cho bot trước
- Kiểm tra kết nối internet
- Test bằng browser: `https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>&text=Test`

#### Cửa sổ không hiển thị (Linux)

```bash
# Kiểm tra DISPLAY
echo $DISPLAY

# Nếu rỗng
export DISPLAY=:0

# Chạy lại
./start.sh
```

### Backend Server

#### Lỗi: SyntaxError: Unexpected token .

**Nguyên nhân:** Node.js phiên bản cũ (< v14) không hỗ trợ optional chaining (`?.`)

**Giải pháp:**
```bash
# Kiểm tra phiên bản Node.js
node --version

# Nếu < v14, cập nhật Node.js
# Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS:
brew install node@18

# Hoặc dùng nvm
nvm install 18
nvm use 18
```

#### Backend không khởi động

```bash
# Kiểm tra port có bị chiếm không
lsof -i :3000

# Kiểm tra log
pm2 logs wifi-checker-backend

# Kiểm tra .env file
cat BE/.env  # Phải có TELEGRAM_BOT_TOKEN
```

#### Bot không phản hồi

```bash
# Kiểm tra bot có chạy không
curl http://localhost:3000/api/telegram/status

# Test gửi tin nhắn
curl -X POST http://localhost:3000/api/telegram/send \
  -H "Content-Type: application/json" \
  -d '{"chatId":"YOUR_CHAT_ID","message":"Test"}'
```

## 📝 Lưu ý

### Desktop App
- Ứng dụng chỉ gửi thông báo khi **trạng thái thay đổi** từ "chưa kết nối" sang "đã kết nối"
- Tên WiFi phải chính xác (phân biệt hoa thường)
- Cấu hình được lưu tại: `~/.config/wifi-telegram-checker/config.json`
- **macOS**: Hỗ trợ macOS 10.13+ (High Sierra trở lên)
- **Linux**: Yêu cầu NetworkManager

### Backend Server
- Yêu cầu Node.js v14+ (hỗ trợ optional chaining)
- File `.env` phải có `TELEGRAM_BOT_TOKEN` trước khi start
- Khuyến nghị dùng PM2 để quản lý process trên server production
- API có rate limiting để bảo mật
- CORS được enable cho mọi origin (có thể tùy chỉnh trong code)

## 🔐 Bảo mật

- **Bot Token**: Không commit file `.env` lên git
- **API Keys**: Giữ private, không chia sẻ
- **Rate Limiting**: Backend có giới hạn 100 requests/15 phút
- **CORS**: Cấu hình lại trong `BE/src/index.js` nếu cần giới hạn domain

## 📚 Tài liệu

- [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) - Hướng dẫn chi tiết về Backend
- [BOT_TOKEN_GUIDE.md](./BOT_TOKEN_GUIDE.md) - Hướng dẫn cấu hình Bot Token
- [BE/README.md](./BE/README.md) - Backend API documentation

## 🚀 Roadmap

- [ ] Hỗ trợ Windows
- [ ] Hỗ trợ nhiều WiFi cùng lúc
- [ ] Thêm notification desktop
- [ ] Dashboard web để quản lý
- [ ] Lưu lịch sử kết nối
- [ ] Hỗ trợ nhiều bot token

## 📄 License

MIT

## 👤 Author

**GameDevToi**
- Website: [gamedevtoi.top](https://gamedevtoi.top)
- Email: nhat.huy.7996@gmail.com
- GitHub: [@nhathuy7996](https://github.com/nhathuy7996)

## 🤝 Contributing

Contributions, issues và feature requests đều được chào đón!

1. Fork project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## ⭐ Support

Nếu project này hữu ích, hãy cho nó một star ⭐️

---

**Made with ❤️ by GameDevToi**
