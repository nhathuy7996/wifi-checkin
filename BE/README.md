# WiFi Checker Backend API

Backend API cho WiFi Checker Electron app. Tự động khởi động bot Telegram khi server start.

## Features

- ✅ Tự động khởi động Telegram bot khi server start
- 📡 REST API để gửi tin nhắn Telegram
- 🔒 Bảo mật với helmet, rate limiting
- 🌐 CORS support
- 💬 Bot commands: /start, /chatid, /help

## Installation

```bash
cd BE
npm install
```

## Configuration

Tạo file `.env` trong thư mục `BE`:

```env
PORT=3000
NODE_ENV=development
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

**Lấy bot token:** Mở [@BotFather](https://t.me/BotFather), gửi `/newbot`

## Usage

```bash
npm start
# hoặc
./start-backend.sh
```

**Lấy Chat ID:** Gửi `/start` cho bot của bạn trên Telegram

## API Endpoints

### POST /api/telegram/send
```json
{"chatId": "123", "message": "Hello"}
```

### POST /api/telegram/wifi-connected
```json
{"chatId": "123", "ssid": "WiFi_Name"}
```

### GET /api/telegram/status
Check bot status

## Bot Commands

- `/start` - Welcome và lấy Chat ID
- `/chatid` - Lấy Chat ID
- `/help` - Danh sách lệnh

## Notes

⚠️ Phải có `TELEGRAM_BOT_TOKEN` trong .env trước khi start server
