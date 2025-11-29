const express = require('express');
const { body } = require('express-validator');
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Send message route
router.post(
  '/',
  protect,
  upload.single('attachment'),
  [
    body('recipientId').notEmpty().withMessage('Recipient ID is required'),
    body('type')
      .isIn(['user', 'group'])
      .withMessage('Message type must be user or group'),
    body('content')
      .optional()
      .isString()
      .withMessage('Content must be a string')
  ],
  messageController.sendMessage
);

// Get conversation with a user
router.get('/user/:userId', protect, messageController.getUserConversation);

// Get conversation with a group
router.get('/group/:groupId', protect, messageController.getGroupConversation);

// Get all conversations
router.get('/conversations', protect, messageController.getAllConversations);

// Get conversations by role
router.get('/conversations/:role', protect, messageController.getConversationsByRole);

module.exports = router;