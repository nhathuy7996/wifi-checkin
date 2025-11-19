import { app, BrowserWindow, ipcMain } from 'electron';
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
  telegramBotToken: string;
  telegramChatId: string;
  checkInterval: number; // in milliseconds
  useCustomBot: boolean; // true = use custom token, false = use .env token
}

let mainWindow: BrowserWindow | null = null;
let checkInterval: NodeJS.Timeout | null = null;
let lastConnectionStatus = false;
let config: Config;

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
  const defaultBotToken = process.env.DEFAULT_BOT_TOKEN || '';
  return {
    targetWiFiSSID: 'YOUR_WIFI_NAME',
    telegramBotToken: '',
    telegramChatId: 'YOUR_CHAT_ID',
    checkInterval: 30000, // 30 seconds
    useCustomBot: false // Default use bot from .env
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

function createWindow() {
  console.log('Creating window...');
  
  // Set icon path (try both locations for development and production)
  const iconPath = path.join(__dirname, 'icon.png');
  
  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    show: false,  // Don't show until ready
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

  mainWindow.on('closed', () => {
    console.log('Window closed');
    mainWindow = null;
  });

  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show - showing now!');
    mainWindow?.show();
    mainWindow?.focus();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  //mainWindow.webContents.openDevTools(); // Open DevTools to debug
}

// Get the correct bot token based on useCustomBot setting
function getBotToken(): string {
  if (config.useCustomBot) {
    return config.telegramBotToken;
  }
  return process.env.DEFAULT_BOT_TOKEN || '';
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
          getBotToken(),
          config.telegramChatId,
          message
        );
        console.log(`[Telegram] Message sent successfully!`);
        
        if (mainWindow) {
          mainWindow.webContents.send('status-update', {
            connected: true,
            message: 'Đã gửi thông báo đến Telegram'
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
    }
    
    lastConnectionStatus = isConnected;
    
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
}

function stopMonitoring() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

app.on('ready', () => {
  console.log('App ready! Starting...');
  console.log('Electron version:', process.versions.electron);
  console.log('Node version:', process.versions.node);
  console.log('Chrome version:', process.versions.chrome);
  
  config = loadConfig();
  console.log('Config loaded:', { ...config, telegramBotToken: '***' });
  
  createWindow();
  
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
  stopMonitoring();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
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
    const botToken = getBotToken();
    
    if (!botToken) {
      mainWindow?.webContents.send('test-result', { 
        success: false, 
        message: 'Bot token không tồn tại. Vui lòng kiểm tra .env hoặc nhập custom token!' 
      });
      return;
    }
    
    await sendTelegramMessage(
      botToken,
      config.telegramChatId,
      message
    );
    mainWindow?.webContents.send('test-result', { success: true, message: 'Gửi thành công!' });
  } catch (error: any) {
    mainWindow?.webContents.send('test-result', { success: false, message: error.message });
  }
});
