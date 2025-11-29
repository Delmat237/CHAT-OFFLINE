const express = require('express');
const { body } = require('express-validator');
const groupController = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Create group route
router.post(
  '/',
  protect,
  [
    body('name').notEmpty().withMessage('Group name is required'),
    body('members').optional().isArray().withMessage('Members must be an array')
  ],
  groupController.createGroup
);

// Get my groups route
router.get('/my-groups', protect, groupController.getMyGroups);

// Add members to a group
router.post(
  '/:groupId/members',
  protect,
  [
    body('members').isArray().withMessage('Members must be an array')
  ],
  groupController.addGroupMembers
);

// Remove a member from a group
router.delete('/:groupId/members/:memberId', protect, groupController.removeGroupMember);

// Delete a group
router.delete('/:groupId', protect, groupController.deleteGroup);

// Search groups
router.get('/search', protect, groupController.searchGroups);

module.exports = router;