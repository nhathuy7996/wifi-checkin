import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';

const execAsync = promisify(exec);

/**
 * Get WiFi SSID on macOS
 */
async function getMacOSWiFiSSID(): Promise<string | null> {
  // Method 1: Use system_profiler (most reliable on modern macOS)
  try {
    const { stdout } = await execAsync('system_profiler SPAirPortDataType');
    console.log('[WiFi Checker macOS] Checking with system_profiler...');
    
    // Look for "Current Network Information:" followed by the SSID
    // Format: "Current Network Information:\n            SSID_NAME:"
    const match = stdout.match(/Current Network Information:[\s\S]*?\n\s+(.+?):/);
    if (match && match[1]) {
      const ssid = match[1].trim();
      console.log('[WiFi Checker macOS] Found SSID:', ssid);
      return ssid;
    }
    console.log('[WiFi Checker macOS] No active WiFi connection found');
  } catch (error) {
    console.error('Error getting macOS WiFi SSID with system_profiler:', error);
  }
  
  // Method 2: Try airport command (deprecated but might work on older macOS)
  try {
    const { stdout } = await execAsync('/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I');
    const match = stdout.match(/\sSSID:\s+(.+)/);
    if (match && match[1]) {
      const ssid = match[1].trim();
      console.log('[WiFi Checker macOS] Found SSID via airport:', ssid);
      return ssid;
    }
  } catch (error) {
    console.error('Error getting macOS WiFi SSID with airport:', error);
  }
  
  // Method 3: Fallback to networksetup
  try {
    const { stdout: portList } = await execAsync('networksetup -listallhardwareports');
    const wifiMatch = portList.match(/Hardware Port: Wi-Fi[\s\S]*?Device: (\w+)/);
    
    if (wifiMatch && wifiMatch[1]) {
      const wifiInterface = wifiMatch[1];
      const { stdout } = await execAsync(`networksetup -getairportnetwork ${wifiInterface}`);
      
      if (!stdout.includes('You are not associated')) {
        const ssidMatch = stdout.match(/Current Wi-Fi Network:\s+(.+)/);
        if (ssidMatch && ssidMatch[1]) {
          const ssid = ssidMatch[1].trim();
          console.log('[WiFi Checker macOS] Found SSID via networksetup:', ssid);
          return ssid;
        }
      }
    }
  } catch (error) {
    console.error('Error getting macOS WiFi SSID with networksetup:', error);
  }
  
  return null;
}

/**
 * Get WiFi SSID on Windows
 */
async function getWindowsWiFiSSID(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('netsh wlan show interfaces');
    const match = stdout.match(/SSID\s+:\s+(.+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
    return null;
  } catch (error) {
    console.error('Error getting Windows WiFi SSID:', error);
    return null;
  }
}

/**
 * Get WiFi SSID on Linux
 */
async function getLinuxWiFiSSID(): Promise<string | null> {
  // Try nmcli first (most common on Linux)
  try {
    const { stdout } = await execAsync('nmcli -t -f active,ssid dev wifi');
    const lines = stdout.trim().split('\n');
    
    for (const line of lines) {
      const [active, ssid] = line.split(':');
      if (active === 'yes' && ssid) {
        return ssid;
      }
    }
  } catch (error) {
    console.error('Error checking WiFi with nmcli:', error);
  }
  
  // Fallback: try iwgetid
  try {
    const { stdout } = await execAsync('iwgetid -r');
    const ssid = stdout.trim();
    if (ssid) return ssid;
  } catch (fallbackError) {
    console.error('Error checking WiFi with iwgetid:', fallbackError);
  }
  
  // Last fallback: try iw
  try {
    const { stdout } = await execAsync('iw dev');
    const match = stdout.match(/ssid\s+(.+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch (iwError) {
    console.error('Error checking WiFi with iw:', iwError);
  }
  
  return null;
}

/**
 * Check if the computer is connected to a specific WiFi network
 * Cross-platform: supports macOS, Windows, and Linux
 */
export async function checkWiFiConnection(targetSSID: string): Promise<boolean> {
  try {
    const currentSSID = await getCurrentWiFiSSID();
    console.log('[WiFi Checker] Current SSID:', currentSSID, 'Target SSID:', targetSSID);
    return currentSSID === targetSSID;
  } catch (error) {
    console.error('Error checking WiFi connection:', error);
    return false;
  }
}

/**
 * Get the current connected WiFi SSID
 * Cross-platform: detects OS and uses appropriate method
 */
export async function getCurrentWiFiSSID(): Promise<string | null> {
  const platform = os.platform();
  
  try {
    switch (platform) {
      case 'darwin': // macOS
        return await getMacOSWiFiSSID();
      
      case 'win32': // Windows
        return await getWindowsWiFiSSID();
      
      case 'linux': // Linux
        return await getLinuxWiFiSSID();
      
      default:
        console.error('Unsupported platform:', platform);
        return null;
    }
  } catch (error) {
    console.error('Error getting current WiFi SSID:', error);
    return null;
  }
}
