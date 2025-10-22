function sendTelegramMessage(message, chat_id=null) {
    const chatId = chat_id || process.env.TELEGRAM_CHAT_ID; // Incase we don't pass chat_id

  const telegramApiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

  return fetch(telegramApiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}


export { sendTelegramMessage };