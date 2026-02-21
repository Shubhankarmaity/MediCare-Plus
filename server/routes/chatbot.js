const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// POST /api/chatbot/ask
router.post('/ask', chatbotController.ask);

// POST /api/chatbot/health-summary
router.post('/health-summary', chatbotController.getHealthSummary);

module.exports = router;
