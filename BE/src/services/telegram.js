const TelegramBot = require('node-telegram-bot-api');

class TelegramService {
  constructor() {
    this.bot = null;
    this.botInfo = null;
  }

  /**
   * Initialize bot on server start
   */
  async initialize() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN not found in environment variables');
    }

    try {
      this.bot = new TelegramBot(botToken, { polling: true });
      this.botInfo = await this.bot.getMe();
      
      console.log('✅ Telegram Bot initialized successfully');
      console.log(`   Bot Name: ${this.botInfo.first_name}`);
      console.log(`   Bot Username: @${this.botInfo.username}`);
      
      // Handle bot commands
      this.setupCommands();
      
      return this.botInfo;
    } catch (error) {
      console.error('❌ Failed to initialize Telegram bot:', error.message);
      throw error;
    }
  }

  /**
   * Setup bot commands
   */
  setupCommands() {
    // Handle /start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      const welcomeMessage = `👋 Xin chào!\n\n` +
        `Tôi là WiFi Checker Bot.\n` +
        `Chat ID của bạn là: \`${chatId}\`\n\n` +
        `Sử dụng Chat ID này trong ứng dụng WiFi Checker.`;
      
      this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    });

    // Handle /chatid command
    this.bot.onText(/\/chatid/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, `Your Chat ID: \`${chatId}\``, { parse_mode: 'Markdown' });
    });

    // Handle /help command
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      const helpMessage = `📖 Available Commands:\n\n` +
        `/start - Welcome message and get Chat ID\n` +
        `/chatid - Get your Chat ID\n` +
        `/help - Show this help message`;
      
      this.bot.sendMessage(chatId, helpMessage);
    });

    console.log('✅ Bot commands configured');
  }

  /**
   * Send a message to Telegram chat
   * @param {string} chatId - Chat ID to send message to
   * @param {string} message - Message text
   * @returns {Promise<Object>} - Telegram API response
   */
  async sendMessage(chatId, message) {
    if (!this.bot) {
      throw new Error('Bot not initialized. Please restart the server.');
    }

    try {
      const result = await this.bot.sendMessage(chatId, message);
      console.log(`✉️  Message sent to ${chatId}: ${result.message_id}`);
      return result;
    } catch (error) {
      console.error('❌ Telegram API error:', error.message);
      throw new Error(`Failed to send Telegram message: ${error.message}`);
    }
  }

  /**
   * Get bot info
   */
  getBotInfo() {
    return this.botInfo;
  }

  /**
   * Check if bot is initialized
   */
  isInitialized() {
    return this.bot !== null;
  }
}

module.exports = new TelegramService();
