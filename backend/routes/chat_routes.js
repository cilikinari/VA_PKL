const express = require('express');
const router = express.Router();
const chat_controllers = require('../controllers/chat_controllers');

// Rute untuk FAQ
router.get('/faq/recommendations', chat_controllers.getRecommendations);
router.post('/chat', chat_controllers.handleChat);

module.exports = router;