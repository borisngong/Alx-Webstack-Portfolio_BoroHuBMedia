const express = require('express');

const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middlewares/authIsAdmin');

// Chat Routes
router.post('/create-chat', authenticateToken, (req, res) => {
  chatController.createChat(req, res);
});

router.post('/create-chat-entry/:chatId', authenticateToken, (req, res) => {
  chatController.createChatEntry(req, res);
});

router.get('/get-chat/:chatId', authenticateToken, (req, res) => {
  chatController.getChat(req, res);
});

router.delete('/delete-chat/:chatId', authenticateToken, (req, res) => {
  chatController.deleteChat(req, res);
});

module.exports = router;
