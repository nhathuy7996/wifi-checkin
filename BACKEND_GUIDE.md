# 🎯 HƯỚNG DẪN SỬ DỤNG BACKEND API

## 📦 Cấu trúc Project

```
checkin/
├── BE/                    # Backend API
│   ├── src/
│   │   ├── index.js      # Main server
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── test-api.js   # Tests
│   ├── package.json
│   └── .env
├── src/                   # Electron App
└── start-backend.sh       # Script khởi động BE
```

## 🚀 CÁCH CHẠY

### Bước 1: Khởi động Backend

```bash
./start-backend.sh
```

Server sẽ chạy tại `http://localhost:3000`

### Bước 2: Chạy Electron App

```bash
./start.sh
# hoặc
npm start
```

## 🔄 FLOW HOẠT ĐỘNG

```
┌─────────────────┐
│  Electron App   │
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTP Request
         │
         ▼
┌─────────────────┐
│   Backend API   │
│  (Express.js)   │
└────────┬────────┘
         │
         │ Telegram API
         │
         ▼
┌─────────────────┐
│  Telegram Bot   │
└─────────────────┘
```

## 📡 API Endpoints

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

### 2. Send Message
```bash
curl -X POST http://localhost:3000/api/telegram/send \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "YOUR_CHAT_ID",
    "message": "Test message",
    "botToken": "YOUR_BOT_TOKEN"
  }'
```

### 3. WiFi Connected
```bash
curl -X POST http://localhost:3000/api/telegram/wifi-connected \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "YOUR_CHAT_ID",
    "ssid": "MyWiFi",
    "botToken": "YOUR_BOT_TOKEN"
  }'
```

## 🧪 TEST

### Test Backend API:

```bash
cd BE

# Sửa config trong src/test-api.js
nano src/test-api.js

# Chạy tests
npm test
```

## ⚙️ CẤU HÌNH

### Backend (.env):

```env
PORT=3000
TELEGRAM_BOT_TOKEN=your_token_here  # Optional
```

### Electron App:

App sẽ tự động gọi API tại `http://localhost:3000`

Để thay đổi API URL, set environment variable:
```bash
export API_URL=http://your-server:3000/api
```

## 🔒 BẢO MẬT

Backend có các tính năng bảo mật:
- ✅ Rate limiting (10 requests/minute)
- ✅ CORS enabled
- ✅ Helmet security headers
- ✅ Input validation

## 🐛 TROUBLESHOOTING

### Backend không khởi động:

```bash
# Kiểm tra port 3000 có bị dùng không
lsof -i :3000

# Kill process nếu cần
kill -9 <PID>
```

### App không gửi được message:

1. Kiểm tra Backend đang chạy: `curl http://localhost:3000/api/health`
2. Xem log backend trong terminal
3. Check Bot Token và Chat ID

### Test Backend riêng:

```bash
cd BE
npm test
```

## 📝 LỢI ÍCH CỦA BACKEND API

1. **Centralized**: Tất cả Telegram logic ở một nơi
2. **Scalable**: Nhiều client có thể dùng chung API
3. **Secure**: Bot token có thể lưu ở server
4. **Logging**: Dễ dàng log và monitor
5. **Rate Limiting**: Tránh spam Telegram API

## 🚀 DEPLOYMENT

### PM2 (Production):

```bash
cd BE
npm install -g pm2
pm2 start src/index.js --name wifi-backend
pm2 save
pm2 startup
```

### Chạy cả 2 services:

```bash
# Terminal 1: Backend
./start-backend.sh

# Terminal 2: App
./start.sh
```

---

**Lưu ý:** Backend phải chạy trước khi khởi động Electron app!
