const express = require('express');
const router = express.Router();
const telegramService = require('../services/telegram');

// POST /api/telegram/send
// Body: { chatId, message }
router.post('/send', async (req, res) => {
  try {
    const { chatId, message } = req.body;

    // Validation
    if (!chatId || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['chatId', 'message']
      });
    }

    // Check if bot is initialized
    if (!telegramService.isInitialized()) {
      return res.status(503).json({ 
        error: 'Telegram bot not initialized. Check server logs.' 
      });
    }

    // Send message
    const result = await telegramService.sendMessage(chatId, message);

    res.json({ 
      success: true, 
      message: 'Telegram message sent successfully',
      messageId: result.message_id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending Telegram message:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send Telegram message',
      details: error.message 
    });
  }
});

// POST /api/telegram/wifi-connected
// Body: { chatId, ssid }
router.post('/wifi-connected', async (req, res) => {
  try {
    const { chatId, ssid, deviceName } = req.body;

    if (!chatId || !ssid) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['chatId', 'ssid']
      });
    }

    // Check if bot is initialized
    if (!telegramService.isInitialized()) {
      return res.status(503).json({ 
        error: 'Telegram bot not initialized. Check server logs.' 
      });
    }

    // Format message
    const message = `✅ WiFi Connected
    
📶 Network: ${ssid}
${deviceName ? `💻 Device: ${deviceName}\n` : ''}⏰ Time: ${new Date().toLocaleString('vi-VN')}`;

    const result = await telegramService.sendMessage(chatId, message);

    res.json({ 
      success: true, 
      message: 'WiFi connection notification sent',
      messageId: result.message_id,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending WiFi notification:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to send notification',
      details: error.message 
    });
  }
});

// GET /api/telegram/status
// Check bot status
router.get('/status', (req, res) => {
  try {
    const botInfo = telegramService.getBotInfo();
    
    if (!botInfo) {
      return res.status(503).json({
        success: false,
        initialized: false,
        error: 'Bot not initialized'
      });
    }

    res.json({ 
      success: true,
      initialized: true,
      bot: {
        id: botInfo.id,
        username: botInfo.username,
        firstName: botInfo.first_name
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
})

module.exports = router;
