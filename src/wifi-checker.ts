import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Check if the computer is connected to a specific WiFi network
 * Uses nmcli (NetworkManager) which is common on Linux systems
 */
export async function checkWiFiConnection(targetSSID: string): Promise<boolean> {
  try {
    // Try nmcli first (most common on Linux)
    const { stdout } = await execAsync('nmcli -t -f active,ssid dev wifi');
    
    // Parse output - format is "yes:SSID_NAME" for active connection
    const lines = stdout.trim().split('\n');
    for (const line of lines) {
      const [active, ssid] = line.split(':');
      if (active === 'yes' && ssid === targetSSID) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking WiFi with nmcli:', error);
    
    // Fallback: try iwgetid
    try {
      const { stdout } = await execAsync('iwgetid -r');
      const currentSSID = stdout.trim();
      return currentSSID === targetSSID;
    } catch (fallbackError) {
      console.error('Error checking WiFi with iwgetid:', fallbackError);
      
      // Last fallback: try iw
      try {
        const { stdout } = await execAsync('iw dev');
        const match = stdout.match(/ssid\s+(.+)/);
        if (match && match[1]) {
          return match[1].trim() === targetSSID;
        }
      } catch (iwError) {
        console.error('Error checking WiFi with iw:', iwError);
      }
    }
    
    return false;
  }
}

/**
 * Get the current connected WiFi SSID
 */
export async function getCurrentWiFiSSID(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('nmcli -t -f active,ssid dev wifi');
    const lines = stdout.trim().split('\n');
    
    for (const line of lines) {
      const [active, ssid] = line.split(':');
      if (active === 'yes') {
        return ssid;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current WiFi SSID:', error);
    
    // Fallback
    try {
      const { stdout } = await execAsync('iwgetid -r');
      return stdout.trim() || null;
    } catch (fallbackError) {
      console.error('Error with fallback method:', fallbackError);
      return null;
    }
  }
}
