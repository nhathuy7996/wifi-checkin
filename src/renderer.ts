const { ipcRenderer, shell } = require('electron');

// DOM elements
const wifiSSIDInput = document.getElementById('wifiSSID') as HTMLInputElement;
const chatIdInput = document.getElementById('chatId') as HTMLInputElement;
const checkIntervalInput = document.getElementById('checkInterval') as HTMLInputElement;
const workDurationInput = document.getElementById('workDuration') as HTMLInputElement;
const countdownDiv = document.getElementById('countdown') as HTMLDivElement;
const getMyIdBtn = document.getElementById('getMyIdBtn') as HTMLButtonElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const testBtn = document.getElementById('testBtn') as HTMLButtonElement;
const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
const statusDot = document.getElementById('statusDot') as HTMLDivElement;
const statusText = document.getElementById('statusText') as HTMLSpanElement;
const statusMessage = document.getElementById('statusMessage') as HTMLDivElement;
const messageBox = document.getElementById('messageBox') as HTMLDivElement;

let isMonitoring = false;

// Handle "Get My ID" button
getMyIdBtn.addEventListener('click', () => {
  // Open Telegram bot in default browser
  const botUsername = 'wifi_checkin_bot'; // Thay bằng username bot của bạn
  const telegramUrl = `https://t.me/${botUsername}?start=getChatId`;
  
  shell.openExternal(telegramUrl);
  showMessage('📱 Đã mở Telegram bot. Gửi /start để nhận Chat ID của bạn!', 'info');
});

// Load config on startup
ipcRenderer.on('config-loaded', (_event: any, config: any) => {
  wifiSSIDInput.value = config.targetWiFiSSID;
  chatIdInput.value = config.telegramChatId;
  checkIntervalInput.value = (config.checkInterval / 1000).toString();
  workDurationInput.value = ((config.workDuration || 28800000) / 3600000).toString();
});

// Save config
saveBtn.addEventListener('click', () => {
  const config = {
    targetWiFiSSID: wifiSSIDInput.value.trim(),
    telegramChatId: chatIdInput.value.trim(),
    checkInterval: parseInt(checkIntervalInput.value) * 1000,
    workDuration: parseFloat(workDurationInput.value) * 3600000
  };

  if (!config.targetWiFiSSID || !config.telegramChatId) {
    showMessage('Vui lòng điền đầy đủ thông tin!', 'error');
    return;
  }

  if (config.checkInterval < 5000) {
    showMessage('Khoảng thời gian kiểm tra tối thiểu là 5 giây!', 'error');
    return;
  }

  ipcRenderer.send('save-config', config);
  showMessage('Đã lưu cấu hình thành công!', 'success');
});

ipcRenderer.on('config-saved', (_event: any, config: any) => {
  console.log('Config saved:', config);
});

// Test Telegram connection
testBtn.addEventListener('click', () => {
  if (!chatIdInput.value.trim()) {
    showMessage('Vui lòng nhập Chat ID!', 'error');
    return;
  }

  testBtn.disabled = true;
  testBtn.textContent = '⏳ Đang gửi...';
  ipcRenderer.send('test-connection');
});

ipcRenderer.on('test-result', (_event: any, result: any) => {
  testBtn.disabled = false;
  testBtn.textContent = '🔔 Test Telegram';
  
  if (result.success) {
    showMessage('✅ ' + result.message, 'success');
  } else {
    showMessage('❌ Lỗi: ' + result.message, 'error');
  }
});

// Start monitoring
startBtn.addEventListener('click', () => {
  if (!wifiSSIDInput.value.trim()) {
    showMessage('Vui lòng nhập tên WiFi!', 'error');
    return;
  }

  ipcRenderer.send('start-monitoring');
  isMonitoring = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  statusText.textContent = 'Đang theo dõi...';
  showMessage('Đã bắt đầu theo dõi kết nối WiFi', 'info');
});

// Stop monitoring
stopBtn.addEventListener('click', () => {
  ipcRenderer.send('stop-monitoring');
  isMonitoring = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  statusDot.classList.remove('connected');
  statusText.textContent = 'Đã dừng theo dõi';
  statusMessage.textContent = '';
  showMessage('Đã dừng theo dõi kết nối WiFi', 'info');
});

// WiFi status update
ipcRenderer.on('wifi-status', (_event: any, data: any) => {
  if (data.connected) {
    statusDot.classList.add('connected');
    statusText.textContent = `Đã kết nối: ${data.ssid}`;
    statusMessage.textContent = '';
  } else {
    statusDot.classList.remove('connected');
    statusText.textContent = `Chưa kết nối đến: ${data.ssid}`;
    statusMessage.textContent = 'Đang chờ kết nối...';
  }
});

// Status update (notification sent)
ipcRenderer.on('status-update', (_event: any, data: any) => {
  if (data.connected) {
    statusMessage.textContent = data.message;
  }
});

// Countdown update
ipcRenderer.on('countdown-update', (_event: any, data: any) => {
  if (data.active) {
    countdownDiv.style.display = 'block';
    const hours = Math.floor(data.remaining / 3600000);
    const minutes = Math.floor((data.remaining % 3600000) / 60000);
    const seconds = Math.floor((data.remaining % 60000) / 1000);
    countdownDiv.textContent = `⏱️ Thời gian còn lại: ${hours}h ${minutes}m ${seconds}s`;
  } else {
    countdownDiv.style.display = 'none';
  }
});

// Work completed notification
ipcRenderer.on('work-completed', (_event: any) => {
  countdownDiv.style.display = 'none';
  showMessage('✅ Đã hoàn thành thời gian làm việc! Đã gửi thông báo "Done" đến Telegram.', 'success');
});

// Helper function to show messages
function showMessage(text: string, type: 'success' | 'error' | 'info') {
  messageBox.innerHTML = `<div class="message ${type}">${text}</div>`;
  
  setTimeout(() => {
    messageBox.innerHTML = '';
  }, 5000);
}
