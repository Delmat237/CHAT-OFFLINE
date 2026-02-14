const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Register route
router.post(
  '/register',
  upload.single('photo'),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('role')
      .isIn(['teacher', 'student', 'worker', 'admin'])
      .withMessage('Role must be teacher, student, worker or admin'),
    body('pseudo').optional().isString().withMessage('Pseudo must be a string')
  ],
  authController.register
);

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

// Logout route
router.post('/logout', protect, authController.logout);

// Change password route
router.patch(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
  ],
  authController.changePassword
);

// Get current user route
router.get('/me', protect, authController.getCurrentUser);

module.exports = router;