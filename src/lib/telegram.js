// Utility to send messages to Telegram Bot from client-side

const getTelegramConfig = () => {
  return {
    botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
    chatId: import.meta.env.VITE_TELEGRAM_CHAT_ID || ''
  };
};

export const sendTelegramMessage = async (text) => {
  const { botToken, chatId } = getTelegramConfig();
  
  if (!botToken || !chatId || botToken.trim() === '' || chatId.trim() === '') {
    console.warn('Telegram notifications not configured in environment variables');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      console.error('Failed to send Telegram message:', await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
};
