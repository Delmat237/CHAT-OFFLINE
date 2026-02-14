const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Update profile route
router.patch(
  '/update-profile',
  protect,
  upload.single('photo'),
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('pseudo').optional().isString().withMessage('Pseudo must be a string'),
    body('status').optional().isIn(['online', 'busy', 'away', 'offline']).withMessage('Invalid status'),
    body('settings').optional().isObject().withMessage('Settings must be an object')
  ],
  userController.updateProfile
);

// Get all users route
router.get('/all', protect, userController.getAllUsers);

// Get users by role route
router.get('/:role', protect, userController.getUsersByRole);

// Search users route
router.get('/search', protect, userController.searchUsers);

module.exports = router;