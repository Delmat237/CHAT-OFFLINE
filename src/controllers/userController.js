const { Op } = require('sequelize');
const { User } = require('../models');
const { validationResult } = require('express-validator');

// Update user profile
const updateProfile = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        errors: errors.array()
      });
    }

    const user = req.user;
    const { name, pseudo, settings, status } = req.body;

    // Update user data
    user.name = name || user.name;
    user.pseudo = pseudo || user.pseudo;
    user.status = status || user.status;

    if (settings) {
      // Merge settings if it's an object, or replace if needed
      user.settings = { ...user.settings, ...settings };
    }

    if (req.file) {
      user.photo = req.file.filename;
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          pseudo: user.pseudo,
          email: user.email,
          role: user.role,
          photo: user.photo,
          status: user.status,
          settings: user.settings
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update profile'
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'pseudo', 'email', 'role', 'photo', 'status', 'lastSeen'],
      where: {
        id: { [Op.ne]: req.user.id }
      }
    });

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get users'
    });
  }
};

// Get users by role
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    // Validate role
    if (!['teacher', 'student', 'worker', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid role. Role must be teacher, student, worker or admin.'
      });
    }

    const users = await User.findAll({
      attributes: ['id', 'name', 'pseudo', 'email', 'photo', 'status', 'lastSeen'],
      where: {
        role,
        id: { [Op.ne]: req.user.id }
      }
    });

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get users by role'
    });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        status: 'fail',
        message: 'Search query is required'
      });
    }

    const users = await User.findAll({
      attributes: ['id', 'name', 'pseudo', 'email', 'role', 'photo', 'status', 'lastSeen'],
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { name: { [Op.like]: `%${query}%` } },
              { pseudo: { [Op.like]: `%${query}%` } },
              { email: { [Op.like]: `%${query}%` } }
            ]
          },
          { id: { [Op.ne]: req.user.id } }
        ]
      }
    });

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search users'
    });
  }
};

module.exports = {
  updateProfile,
  getAllUsers,
  getUsersByRole,
  searchUsers
};