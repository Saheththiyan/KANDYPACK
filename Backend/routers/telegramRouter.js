import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import * as telegramController from '../controllers/telegramController.js';

const router = express.Router();

// Admin routes (require admin authentication)
router.post('/generate-link', authenticateAdmin, telegramController.generateRegistrationLink);
// router.post('/send-notification', authenticateAdmin, telegramController.sendNotification);

// Webhook route (public - called by Telegram)
router.post('/webhook', telegramController.telegramWebhook);

export default router;