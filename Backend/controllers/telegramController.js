import jwt from 'jsonwebtoken';
import { updateDriverChatId, updateAssistantChatId } from '../models/telegramModel.js';
import { sendTelegramMessage } from '../utils/sendTelegram.js';

// Generate registration link for driver/assistant
export async function generateRegistrationLink(req, res) {
  try {
    const { type, id } = req.body; // type: 'driver' or 'assistant', id: driver_id or assistant_id
    
    if (!type || !id || !['driver', 'assistant'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be "driver" or "assistant" with valid ID'
      });
    }

    // Create JWT token with type and ID
    const token = jwt.sign(
      { 
        type: type,
        id: id,
        exp: Math.floor(Date.now() / 1000) + (60 * 15) // 15 minutes expiry
      },
      process.env.JWT_SECRET
    );

    const registrationMessage = `Please send this token to your Telegram bot to complete registration:\n\n/register ${token}`;

    res.json({
      success: true,
      token: token,
      message: registrationMessage,
      expiresIn: '15 minutes'
    });
  } catch (error) {
    console.error('Generate registration link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate registration link'
    });
  }
}

// Webhook endpoint for Telegram bot
export async function telegramWebhook(req, res) {
  try {
    const { message } = req.body;
    
    if (!message || !message.text) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();

    // Check if message starts with /register
    if (text.startsWith('/register ')) {
      const token = text.replace('/register ', '').trim();
      
      try {
        // Verify and decode JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { type, id } = decoded;

        let updateResult;
        let personName;

        if (type === 'driver') {
          updateResult = await updateDriverChatId(id, chatId);
          personName = updateResult.name;
        } else if (type === 'assistant') {
          updateResult = await updateAssistantChatId(id, chatId);
          personName = updateResult.name;
        } else {
          throw new Error('Invalid registration type');
        }

        if (updateResult.success) {
          // Send success message to user
          await sendTelegramMessage(
            `✅ Registration successful!\n\nHello ${personName}!\nYour Telegram account has been linked to your ${type} profile.\n\nYou will now receive notifications about:\n• Work schedules\n• Delivery assignments\n• Important updates`,
            chatId
          );

          // Log successful registration
          console.log(`${type} ${personName} (ID: ${id}) registered with chat_id: ${chatId}`);
        } else {
          await sendTelegramMessage(
            '❌ Registration failed. Please contact your administrator.',
            chatId
          );
        }
      } catch (jwtError) {
        console.error('JWT verification error:', jwtError);
        await sendTelegramMessage(
          '❌ Invalid or expired registration token. Please request a new registration link from your administrator.',
          chatId
        );
      }
    } else if (text.startsWith('/start')) {
      // Welcome message
      await sendTelegramMessage(
        `👋 Welcome to KandyPack Notifications!\n\nTo register your account, please ask your administrator for a registration link.\n\nOnce registered, you'll receive important notifications about your work schedule and assignments.`,
        chatId
      );
    } else {
      // Unknown command
      await sendTelegramMessage(
        '❓ Unknown command. Available commands:\n/start - Show welcome message\n/register <token> - Register your account',
        chatId
      );
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Send notification to driver or assistant
export async function sendNotification(req, res) {
  try {
    const { type, id, message } = req.body;
    
    if (!type || !id || !message || !['driver', 'assistant'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameters. Requires type (driver/assistant), id, and message'
      });
    }

    // Get chat_id from database
    let chatId;
    if (type === 'driver') {
      const driver = await getDriverById(id);
      chatId = driver?.chat_id;
    } else {
      const assistant = await getAssistantById(id);
      chatId = assistant?.chat_id;
    }

    if (!chatId) {
      return res.status(404).json({
        success: false,
        message: `${type} not found or not registered with Telegram`
      });
    }

    await sendTelegramMessage(message, chatId);

    res.json({
      success: true,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
}