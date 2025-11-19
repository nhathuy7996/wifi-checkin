const { ipcRenderer } = require('electron');

// DOM elements
const wifiSSIDInput = document.getElementById('wifiSSID') as HTMLInputElement;
const useCustomBotCheckbox = document.getElementById('useCustomBot') as HTMLInputElement;
const botTokenContainer = document.getElementById('botTokenContainer') as HTMLDivElement;
const botTokenInput = document.getElementById('botToken') as HTMLInputElement;
const chatIdInput = document.getElementById('chatId') as HTMLInputElement;
const checkIntervalInput = document.getElementById('checkInterval') as HTMLInputElement;
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const testBtn = document.getElementById('testBtn') as HTMLButtonElement;
const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
const statusDot = document.getElementById('statusDot') as HTMLDivElement;
const statusText = document.getElementById('statusText') as HTMLSpanElement;
const statusMessage = document.getElementById('statusMessage') as HTMLDivElement;
const messageBox = document.getElementById('messageBox') as HTMLDivElement;

let isMonitoring = false;

// Toggle bot token input based on checkbox
function updateBotTokenVisibility() {
  if (useCustomBotCheckbox.checked) {
    botTokenContainer.classList.remove('disabled');
    botTokenInput.disabled = false;
  } else {
    botTokenContainer.classList.add('disabled');
    botTokenInput.disabled = true;
  }
}

// Handle checkbox change
useCustomBotCheckbox.addEventListener('change', () => {
  updateBotTokenVisibility();
});

// Load config on startup
ipcRenderer.on('config-loaded', (_event: any, config: any) => {
  wifiSSIDInput.value = config.targetWiFiSSID;
  botTokenInput.value = config.telegramBotToken || '';
  chatIdInput.value = config.telegramChatId;
  checkIntervalInput.value = (config.checkInterval / 1000).toString();
  useCustomBotCheckbox.checked = config.useCustomBot || false;
  updateBotTokenVisibility();
});

// Save config
saveBtn.addEventListener('click', () => {
  const useCustomBot = useCustomBotCheckbox.checked;
  const config = {
    targetWiFiSSID: wifiSSIDInput.value.trim(),
    telegramBotToken: botTokenInput.value.trim(),
    telegramChatId: chatIdInput.value.trim(),
    checkInterval: parseInt(checkIntervalInput.value) * 1000,
    useCustomBot: useCustomBot
  };

  if (!config.targetWiFiSSID || !config.telegramChatId) {
    showMessage('Vui lòng điền đầy đủ thông tin!', 'error');
    return;
  }

  // Check bot token only if using custom bot
  if (useCustomBot && !config.telegramBotToken) {
    showMessage('Vui lòng nhập Bot Token hoặc bỏ chọn "Sử dụng Telegram Bot riêng"!', 'error');
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
  const useCustomBot = useCustomBotCheckbox.checked;
  
  if (!chatIdInput.value.trim()) {
    showMessage('Vui lòng nhập Chat ID!', 'error');
    return;
  }

  // Check bot token only if using custom bot
  if (useCustomBot && !botTokenInput.value.trim()) {
    showMessage('Vui lòng nhập Bot Token hoặc bỏ chọn "Sử dụng Telegram Bot riêng"!', 'error');
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

// Helper function to show messages
function showMessage(text: string, type: 'success' | 'error' | 'info') {
  messageBox.innerHTML = `<div class="message ${type}">${text}</div>`;
  
  setTimeout(() => {
    messageBox.innerHTML = '';
  }, 5000);
}
