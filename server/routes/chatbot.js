const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const auth = require('../middleware/auth');

// POST /api/chatbot/ask
router.post('/ask', chatbotController.ask);

// POST /api/chatbot/health-summary
router.post('/health-summary', chatbotController.getHealthSummary);

// POST /api/chatbot/feedback — submit user feedback for a response
router.post('/feedback', chatbotController.submitFeedback);

// GET /api/chatbot/analytics — get chatbot performance metrics (admin only)
router.get('/analytics', auth, chatbotController.getAnalytics);

module.exports = router;
