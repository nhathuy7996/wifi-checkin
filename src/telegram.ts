// @ts-ignore
import TelegramBot from 'node-telegram-bot-api';

/**
 * Send a message to a Telegram chat
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string
): Promise<void> {
  try {
    const bot = new TelegramBot(botToken, { polling: false });
    await bot.sendMessage(chatId, message);
    console.log('Telegram message sent successfully');
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}
