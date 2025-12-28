const { Op } = require('sequelize');
const { Group, User, GroupUser } = require('../models');

// Create a new group
const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const createdBy = req.user.id;

    // Create group
    const group = await Group.create({
      name,
      createdBy
    });

    // Add creator as admin
    await GroupUser.create({
      groupId: group.id,
      userId: createdBy,
      isAdmin: true
    });

    // Add members if provided
    if (members && members.length > 0) {
      const memberPromises = members.map(memberId => {
        return GroupUser.create({
          groupId: group.id,
          userId: memberId,
          isAdmin: false
        });
      });

      await Promise.all(memberPromises);
    }

    // Get the group with members
    const groupWithMembers = await Group.findByPk(group.id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'photo', 'status', 'role']
      }]
    });

    // Emit socket event to all group members
    const io = req.app.get('io');
    if (io) {
      const allMembers = [createdBy, ...(members || [])];
      allMembers.forEach(memberId => {
        io.to(`user_${memberId}`).emit('groupCreated', {
          group: groupWithMembers
        });
      });
      console.log(`Emitted groupCreated event to ${allMembers.length} members`);
    }

    res.status(201).json({
      status: 'success',
      data: {
        group: groupWithMembers
      }
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create group'
    });
  }
};

// Get all groups for the current user
const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all groups the user is a member of
    const userWithGroups = await User.findByPk(userId, {
      include: [{
        model: Group,
        where: {
          isDeleted: false
        },
        through: {
          attributes: ['isAdmin', 'joinedAt']
        }
      }]
    });

    if (!userWithGroups || !userWithGroups.Groups) {
      return res.status(200).json({
        status: 'success',
        results: 0,
        data: { groups: [] }
      });
    }

    res.status(200).json({
      status: 'success',
      results: userWithGroups.Groups.length,
      data: { groups: userWithGroups.Groups }
    });
  } catch (error) {
    console.error('Get my groups error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get groups'
    });
  }
};

// Add members to a group
const addGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { members } = req.body;
    const userId = req.user.id;

    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        status: 'fail',
        message: 'Group not found'
      });
    }

    // Check if user is an admin of the group
    const isAdmin = await GroupUser.findOne({
      where: {
        groupId,
        userId,
        isAdmin: true
      }
    });

    if (!isAdmin) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to add members to this group'
      });
    }

    // Add members to the group
    const memberPromises = members.map(async (memberId) => {
      // Check if the member is already in the group
      const existingMember = await GroupUser.findOne({
        where: {
          groupId,
          userId: memberId
        }
      });

      if (!existingMember) {
        return GroupUser.create({
          groupId,
          userId: memberId,
          isAdmin: false
        });
      }

      return null;
    });

    await Promise.all(memberPromises);

    // Get the updated group with members
    const updatedGroup = await Group.findByPk(groupId, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'photo', 'status', 'role']
      }]
    });

    res.status(200).json({
      status: 'success',
      data: {
        group: updatedGroup
      }
    });
  } catch (error) {
    console.error('Add group members error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add members to group'
    });
  }
};

// Remove a member from a group
const removeGroupMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user.id;

    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        status: 'fail',
        message: 'Group not found'
      });
    }

    // Check if user is an admin of the group
    const isAdmin = await GroupUser.findOne({
      where: {
        groupId,
        userId,
        isAdmin: true
      }
    });

    if (!isAdmin && userId !== memberId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to remove members from this group'
      });
    }

    // Remove the member from the group
    await GroupUser.destroy({
      where: {
        groupId,
        userId: memberId
      }
    });

    // Get the updated group with members
    const updatedGroup = await Group.findByPk(groupId, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'photo', 'status', 'role']
      }]
    });

    res.status(200).json({
      status: 'success',
      data: {
        group: updatedGroup
      }
    });
  } catch (error) {
    console.error('Remove group member error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove member from group'
    });
  }
};

// Delete a group
const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        status: 'fail',
        message: 'Group not found'
      });
    }

    // Check if user is an admin of the group
    const isAdmin = await GroupUser.findOne({
      where: {
        groupId,
        userId,
        isAdmin: true
      }
    });

    if (!isAdmin) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to delete this group'
      });
    }

    // Mark the group as deleted
    group.isDeleted = true;
    await group.save();

    res.status(200).json({
      status: 'success',
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete group'
    });
  }
};

// Search groups
const searchGroups = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

    if (!query) {
      return res.status(400).json({
        status: 'fail',
        message: 'Search query is required'
      });
    }

    // Get all groups the user is a member of that match the query
    const groups = await Group.findAll({
      where: {
        name: { [Op.like]: `%${query}%` },
        isDeleted: false
      },
      include: [{
        model: User,
        where: { id: userId }
      }]
    });

    res.status(200).json({
      status: 'success',
      results: groups.length,
      data: { groups }
    });
  } catch (error) {
    console.error('Search groups error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search groups'
    });
  }
};

module.exports = {
  createGroup,
  getMyGroups,
  addGroupMembers,
  removeGroupMember,
  deleteGroup,
  searchGroups
};