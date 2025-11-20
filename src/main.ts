import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import { checkWiFiConnection } from './wifi-checker';
import { sendTelegramMessage } from './telegram';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load .env file from the app root directory (development or production)
const envPath = app.isPackaged 
  ? path.join(process.resourcesPath, '.env')
  : path.join(__dirname, '..', '.env');

dotenv.config({ path: envPath });

interface Config {
  targetWiFiSSID: string;
  telegramChatId: string;
  checkInterval: number; // in milliseconds
  workDuration: number; // in milliseconds
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let checkInterval: NodeJS.Timeout | null = null;
let lastConnectionStatus = false;
let config: Config;
let workTimer: NodeJS.Timeout | null = null;
let countdownInterval: NodeJS.Timeout | null = null;
let workStartTime: number | null = null;
let workEndTime: number | null = null;

// Load or create config
const configPath = path.join(app.getPath('userData'), 'config.json');

function loadConfig(): Config {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading config:', error);
  }

  // Default config
  return {
    targetWiFiSSID: 'YOUR_WIFI_NAME',
    telegramChatId: 'YOUR_CHAT_ID',
    checkInterval: 30000, // 30 seconds
    workDuration: 28800000 // 8 hours
  };
}

function saveConfig(newConfig: Config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
    config = newConfig;
  } catch (error) {
    console.error('Error saving config:', error);
  }
}

function createTray() {
  const iconPath = path.join(__dirname, 'icon.png');
  
  try {
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon.resize({ width: 16, height: 16 }));
    
    tray.setToolTip('WiFi Checker');
    
    // Click to show/hide window
    tray.on('click', () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
    
    updateTrayMenu();
    console.log('System tray created');
  } catch (error) {
    console.error('Error creating tray:', error);
  }
}

function updateTrayMenu() {
  if (!tray) return;
  
  const isMonitoring = checkInterval !== null;
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'WiFi Checker',
      enabled: false
    },
    { type: 'separator' },
    {
      label: isMonitoring ? '✅ Đang theo dõi' : '⏸️ Đã dừng',
      enabled: false
    },
    {
      label: lastConnectionStatus ? `📶 Đã kết nối: ${config.targetWiFiSSID}` : '📶 Chưa kết nối',
      enabled: false
    },
    { type: 'separator' },
    {
      label: '🖥️ Hiển thị cửa sổ',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: isMonitoring ? '⏸️ Dừng theo dõi' : '▶️ Bắt đầu theo dõi',
      click: () => {
        if (isMonitoring) {
          stopMonitoring();
        } else {
          startMonitoring();
        }
      }
    },
    { type: 'separator' },
    {
      label: '🚪 Thoát',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
}

function createWindow() {
  console.log('Creating window...');
  
  // Set icon path (try both locations for development and production)
  const iconPath = path.join(__dirname, 'icon.png');
  
  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    show: false,  // Start hidden in tray
    center: true,
    resizable: true,
    backgroundColor: '#ffffff',
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  console.log('Loading HTML file...');
  const htmlPath = path.join(__dirname, 'renderer.html');
  console.log('HTML path:', htmlPath);
  
  mainWindow.loadFile(htmlPath);

  // Hide to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
      console.log('Window hidden to tray');
    }
  });

  mainWindow.on('closed', () => {
    console.log('Window closed');
    mainWindow = null;
  });

  mainWindow.once('ready-to-show', () => {
    console.log('Window ready - starting in tray mode');
    // Don't show window automatically, let user open from tray
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  //mainWindow.webContents.openDevTools(); // Open DevTools to debug
}

function startWorkTimer() {
  // Clear existing timers
  if (workTimer) clearTimeout(workTimer);
  if (countdownInterval) clearInterval(countdownInterval);

  workStartTime = Date.now();
  workEndTime = workStartTime + config.workDuration;

  console.log(`[Work Timer] Started - Duration: ${config.workDuration / 3600000} hours`);

  // Update countdown every second
  countdownInterval = setInterval(() => {
    const remaining = workEndTime! - Date.now();
    
    if (remaining <= 0) {
      clearInterval(countdownInterval!);
      countdownInterval = null;
      return;
    }

    if (mainWindow) {
      mainWindow.webContents.send('countdown-update', {
        active: true,
        remaining: remaining
      });
    }
  }, 1000);

  // Set timer to send "Done" message when work duration is complete
  workTimer = setTimeout(async () => {
    console.log('[Work Timer] Completed! Sending "Done" notification...');
    
    try {
      const message = `✅ Done\n\nThời gian làm việc: ${config.workDuration / 3600000}h\nHoàn thành lúc: ${new Date().toLocaleString('vi-VN')}`;
      await sendTelegramMessage(config.telegramChatId, message);
      
      if (mainWindow) {
        mainWindow.webContents.send('work-completed');
        mainWindow.webContents.send('countdown-update', { active: false });
      }
    } catch (error) {
      console.error('Error sending "Done" message:', error);
    }
    
    workTimer = null;
    workStartTime = null;
    workEndTime = null;
  }, config.workDuration);
}

function stopWorkTimer() {
  if (workTimer) {
    clearTimeout(workTimer);
    workTimer = null;
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  workStartTime = null;
  workEndTime = null;
  
  if (mainWindow) {
    mainWindow.webContents.send('countdown-update', { active: false });
  }
  
  console.log('[Work Timer] Stopped');
}

async function checkAndNotify() {
  try {
    const isConnected = await checkWiFiConnection(config.targetWiFiSSID);
    console.log(`[WiFi Check] Target: ${config.targetWiFiSSID} | Connected: ${isConnected} | Last Status: ${lastConnectionStatus}`);
    
    // Send notification only when status changes from disconnected to connected
    if (isConnected && !lastConnectionStatus) {
      console.log(`[WiFi Check] Status changed to CONNECTED! Sending notification...`);
      const message = `✅ Đã kết nối đến WiFi: ${config.targetWiFiSSID}\nThời gian: ${new Date().toLocaleString('vi-VN')}`;
      
      try {
        await sendTelegramMessage(
          config.telegramChatId,
          message
        );
        console.log(`[Telegram] Message sent successfully!`);
        
        // Start work timer when connected to WiFi
        startWorkTimer();
        
        if (mainWindow) {
          mainWindow.webContents.send('status-update', {
            connected: true,
            message: 'Đã gửi thông báo đến Telegram. Bắt đầu đếm ngược...'
          });
        }
      } catch (error) {
        console.error('Error sending Telegram message:', error);
        if (mainWindow) {
          mainWindow.webContents.send('status-update', {
            connected: true,
            message: 'Lỗi khi gửi thông báo Telegram'
          });
        }
      }
    } else if (!isConnected && lastConnectionStatus) {
      // WiFi disconnected - stop work timer
      console.log('[WiFi Check] Disconnected from target WiFi. Stopping work timer.');
      stopWorkTimer();
    }
    
    lastConnectionStatus = isConnected;
    
    // Update tray menu when connection status changes
    updateTrayMenu();
    
    if (mainWindow) {
      mainWindow.webContents.send('wifi-status', {
        connected: isConnected,
        ssid: config.targetWiFiSSID
      });
    }
  } catch (error) {
    console.error('Error checking WiFi:', error);
  }
}

function startMonitoring() {
  if (checkInterval) {
    clearInterval(checkInterval);
  }
  
  // Check immediately
  checkAndNotify();
  
  // Then check at intervals
  checkInterval = setInterval(checkAndNotify, config.checkInterval);
  
  // Update tray menu
  updateTrayMenu();
}

function stopMonitoring() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
  stopWorkTimer();
  
  // Update tray menu
  updateTrayMenu();
}

app.on('ready', () => {
  console.log('App ready! Starting...');
  console.log('Electron version:', process.versions.electron);
  console.log('Node version:', process.versions.node);
  console.log('Chrome version:', process.versions.chrome);
  
  config = loadConfig();
  console.log('Config loaded:', { ...config, telegramBotToken: '***' });
  
  createWindow();
  createTray();
  
  // Send config to renderer
  if (mainWindow) {
    mainWindow.webContents.on('did-finish-load', () => {
      console.log('Sending config to renderer...');
      mainWindow?.webContents.send('config-loaded', config);
    });
  }
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  // Don't quit - keep running in tray
  // App will only quit when user selects "Quit" from tray menu
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  stopMonitoring();
});

// IPC handlers
ipcMain.on('start-monitoring', () => {
  startMonitoring();
});

ipcMain.on('stop-monitoring', () => {
  stopMonitoring();
});

ipcMain.on('save-config', (event: any, newConfig: Config) => {
  saveConfig(newConfig);
  stopMonitoring();
  event.reply('config-saved', config);
});

ipcMain.on('test-connection', async () => {
  try {
    const message = `🔔 Test thông báo từ WiFi Checker\nThời gian: ${new Date().toLocaleString('vi-VN')}`;
    
    await sendTelegramMessage(
      config.telegramChatId,
      message
    );
    mainWindow?.webContents.send('test-result', { success: true, message: 'Gửi thành công!' });
  } catch (error: any) {
    mainWindow?.webContents.send('test-result', { success: false, message: error.message });
  }
});
