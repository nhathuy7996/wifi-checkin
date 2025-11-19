# Hướng dẫn cấu hình Bot Token

Ứng dụng hỗ trợ 2 cách sử dụng Telegram Bot:

## 1. Sử dụng Bot Token mặc định (từ file .env)

Đây là cách khuyên dùng nếu bạn muốn tất cả người dùng đều dùng cùng 1 bot.

### Cách thiết lập:

1. Copy file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```

2. Mở file `.env` và thêm bot token của bạn:
   ```env
   DEFAULT_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

3. Trong giao diện ứng dụng, **KHÔNG** chọn checkbox "Sử dụng Telegram Bot riêng"

4. Chỉ cần điền:
   - Tên WiFi (SSID)
   - Chat ID
   - Khoảng thời gian kiểm tra

## 2. Sử dụng Custom Bot Token

Nếu bạn muốn mỗi user tự dùng bot riêng của họ.

### Cách thiết lập:

1. Trong giao diện ứng dụng, **CHỌN** checkbox "Sử dụng Telegram Bot riêng"

2. Input field "Telegram Bot Token" sẽ được mở

3. Điền đầy đủ:
   - Tên WiFi (SSID)
   - Telegram Bot Token (của riêng bạn)
   - Chat ID
   - Khoảng thời gian kiểm tra

## Lấy Bot Token ở đâu?

1. Mở Telegram và tìm @BotFather
2. Gửi lệnh `/newbot`
3. Làm theo hướng dẫn để tạo bot mới
4. Copy token mà BotFather gửi cho bạn

## Lấy Chat ID ở đâu?

1. Tìm bot @userinfobot hoặc @getidsbot trên Telegram
2. Gửi bất kỳ tin nhắn nào
3. Bot sẽ trả về Chat ID của bạn

## Lưu ý quan trọng

- File `.env` không được đưa lên Git (đã có trong .gitignore)
- Khi build ứng dụng, file `.env` sẽ được đóng gói vào app
- Nếu không có `.env` hoặc `DEFAULT_BOT_TOKEN` trống, user BẮT BUỘC phải chọn "Use Custom Bot"
