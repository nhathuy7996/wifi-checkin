/**
 * Send a message to a Telegram chat via Backend API
 * Backend will use the bot token configured in its .env file
 */
export async function sendTelegramMessage(
  chatId: string,
  message: string
): Promise<void> {
  const API_URL = process.env.API_URL || 'http://localhost:3000/api';
  
  try {
    const response = await fetch(`${API_URL}/telegram/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chatId,
        message
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send Telegram message');
    }

    const result = await response.json();
    console.log('Telegram message sent successfully:', result);
  } catch (error: any) {
    console.error('Error sending Telegram message:', error);
    throw new Error(`Failed to send message: ${error.message}`);
  }
}
