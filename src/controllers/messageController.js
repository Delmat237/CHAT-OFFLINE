const { Op } = require('sequelize');
const { User, Message, Group } = require('../models');
const { encryptMessage, decryptMessage } = require('../utils/encryption');

// Send a message to a user or group
const sendMessage = async (req, res) => {
  try {
    const { recipientId, content, type } = req.body;
    const senderId = req.user.id;

    // Validate recipient exists
    let recipient;
    if (type === 'user') {
      recipient = await User.findByPk(recipientId);
    } else if (type === 'group') {
      recipient = await Group.findByPk(recipientId);
    }

    if (!recipient) {
      return res.status(404).json({
        status: 'fail',
        message: `${type === 'user' ? 'User' : 'Group'} not found`
      });
    }

    // Encrypt message content
    const encryptedContent = content ? encryptMessage(content) : null;

    // Create message
    const message = await Message.create({
      type,
      senderId,
      recipientId,
      content: encryptedContent,
      attachment: req.file ? req.file.filename : null,
      attachmentType: req.file ? req.file.mimetype : null,
      sentDate: new Date(),
      sentTime: new Date().toTimeString().split(' ')[0]
    });

    // Decrypt the message content for the response
    const decryptedMessage = {
      ...message.toJSON(),
      content: message.content ? decryptMessage(message.content) : null
    };

    res.status(201).json({
      status: 'success',
      data: {
        message: decryptedMessage
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send message'
    });
  }
};

// Get conversation with a specific user
const getUserConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    // Get messages between the two users
    const messages = await Message.findAll({
      where: {
        type: 'user',
        [Op.or]: [
          {
            senderId: currentUserId,
            recipientId: userId
          },
          {
            senderId: userId,
            recipientId: currentUserId
          }
        ],
        isDeleted: false
      },
      order: [['sentDate', 'ASC'], ['sentTime', 'ASC']]
    });

    // Decrypt message contents
    const decryptedMessages = messages.map(message => {
      const messageJson = message.toJSON();
      return {
        ...messageJson,
        content: messageJson.content ? decryptMessage(messageJson.content) : null
      };
    });

    res.status(200).json({
      status: 'success',
      results: decryptedMessages.length,
      data: {
        messages: decryptedMessages,
        user: {
          id: user.id,
          name: user.name,
          photo: user.photo,
          status: user.status,
          lastSeen: user.lastSeen
        }
      }
    });
  } catch (error) {
    console.error('Get user conversation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get conversation'
    });
  }
};

// Get conversation with a specific group
const getGroupConversation = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        status: 'fail',
        message: 'Group not found'
      });
    }

    // Get messages in the group
    const messages = await Message.findAll({
      where: {
        type: 'group',
        recipientId: groupId,
        isDeleted: false
      },
      order: [['sentDate', 'ASC'], ['sentTime', 'ASC']]
    });

    // Decrypt message contents
    const decryptedMessages = messages.map(message => {
      const messageJson = message.toJSON();
      return {
        ...messageJson,
        content: messageJson.content ? decryptMessage(messageJson.content) : null
      };
    });

    // Get all members of the group
    const members = await group.getUsers({
      attributes: ['id', 'name', 'photo', 'status', 'lastSeen']
    });

    res.status(200).json({
      status: 'success',
      results: decryptedMessages.length,
      data: {
        messages: decryptedMessages,
        group: {
          id: group.id,
          name: group.name,
          creationDate: group.creationDate,
          members
        }
      }
    });
  } catch (error) {
    console.error('Get group conversation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get group conversation'
    });
  }
};

// Get all conversations for the current user
const getAllConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all user conversations
    const userMessages = await Message.findAll({
      where: {
        type: 'user',
        [Op.or]: [
          { senderId: userId },
          { recipientId: userId }
        ],
        isDeleted: false
      },
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('recipientId')), 'recipientId'],
        [sequelize.fn('DISTINCT', sequelize.col('senderId')), 'senderId'],
        [sequelize.fn('MAX', sequelize.col('sentDate')), 'lastMessageDate'],
        [sequelize.fn('MAX', sequelize.col('sentTime')), 'lastMessageTime']
      ],
      group: [
        'recipientId',
        'senderId'
      ],
      order: [
        ['lastMessageDate', 'DESC'],
        ['lastMessageTime', 'DESC']
      ]
    });

    // Process user conversations
    const userConversations = await Promise.all(
      userMessages.map(async (message) => {
        const partnerId = message.senderId === userId ? message.recipientId : message.senderId;
        const partner = await User.findByPk(partnerId, {
          attributes: ['id', 'name', 'photo', 'status', 'role', 'lastSeen']
        });
        
        // Get the last message
        const lastMessage = await Message.findOne({
          where: {
            type: 'user',
            [Op.or]: [
              {
                senderId: userId,
                recipientId: partnerId
              },
              {
                senderId: partnerId,
                recipientId: userId
              }
            ],
            isDeleted: false
          },
          order: [['sentDate', 'DESC'], ['sentTime', 'DESC']]
        });

        return {
          id: partner.id,
          name: partner.name,
          photo: partner.photo,
          status: partner.status,
          role: partner.role,
          lastSeen: partner.lastSeen,
          lastMessage: {
            content: lastMessage.content ? decryptMessage(lastMessage.content) : null,
            sentDate: lastMessage.sentDate,
            sentTime: lastMessage.sentTime,
            senderId: lastMessage.senderId
          }
        };
      })
    );

    // Get all group conversations
    const groupMessages = await Message.findAll({
      where: {
        type: 'group',
        [Op.or]: [
          { senderId: userId },
          { '$Group.Users.id$': userId }
        ],
        isDeleted: false
      },
      include: [{
        model: Group,
        include: [{
          model: User,
          where: { id: userId }
        }]
      }],
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('recipientId')), 'groupId'],
        [sequelize.fn('MAX', sequelize.col('sentDate')), 'lastMessageDate'],
        [sequelize.fn('MAX', sequelize.col('sentTime')), 'lastMessageTime']
      ],
      group: ['groupId'],
      order: [
        ['lastMessageDate', 'DESC'],
        ['lastMessageTime', 'DESC']
      ]
    });

    // Process group conversations
    const groupConversations = await Promise.all(
      groupMessages.map(async (message) => {
        const group = await Group.findByPk(message.groupId);
        
        // Get the last message
        const lastMessage = await Message.findOne({
          where: {
            type: 'group',
            recipientId: group.id,
            isDeleted: false
          },
          order: [['sentDate', 'DESC'], ['sentTime', 'DESC']]
        });

        return {
          id: group.id,
          name: group.name,
          type: 'group',
          creationDate: group.creationDate,
          lastMessage: {
            content: lastMessage.content ? decryptMessage(lastMessage.content) : null,
            sentDate: lastMessage.sentDate,
            sentTime: lastMessage.sentTime,
            senderId: lastMessage.senderId
          }
        };
      })
    );

    // Combine and sort conversations
    const allConversations = [...userConversations, ...groupConversations].sort((a, b) => {
      const dateA = new Date(`${a.lastMessage.sentDate}T${a.lastMessage.sentTime}`);
      const dateB = new Date(`${b.lastMessage.sentDate}T${b.lastMessage.sentTime}`);
      return dateB - dateA;
    });

    res.status(200).json({
      status: 'success',
      results: allConversations.length,
      data: { conversations: allConversations }
    });
  } catch (error) {
    console.error('Get all conversations error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get conversations'
    });
  }
};

// Get conversations by role
const getConversationsByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user.id;

    // Validate role
    if (!['teacher', 'student', 'worker'].includes(role)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid role. Role must be teacher, student, or worker.'
      });
    }

    // Get all user conversations with the specified role
    const conversations = await Message.findAll({
      where: {
        type: 'user',
        [Op.or]: [
          { senderId: userId },
          { recipientId: userId }
        ],
        isDeleted: false,
        [Op.or]: [
          { '$Sender.role$': role },
          { '$Recipient.role$': role }
        ]
      },
      include: [
        {
          model: User,
          as: 'Sender',
          attributes: ['id', 'name', 'photo', 'status', 'role', 'lastSeen']
        },
        {
          model: User,
          as: 'Recipient',
          attributes: ['id', 'name', 'photo', 'status', 'role', 'lastSeen']
        }
      ],
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('recipientId')), 'recipientId'],
        [sequelize.fn('DISTINCT', sequelize.col('senderId')), 'senderId'],
        [sequelize.fn('MAX', sequelize.col('sentDate')), 'lastMessageDate'],
        [sequelize.fn('MAX', sequelize.col('sentTime')), 'lastMessageTime']
      ],
      group: [
        'recipientId',
        'senderId'
      ],
      order: [
        ['lastMessageDate', 'DESC'],
        ['lastMessageTime', 'DESC']
      ]
    });

    // Process conversations
    const processedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const partnerId = conversation.senderId === userId ? conversation.recipientId : conversation.senderId;
        const partner = conversation.senderId === userId ? conversation.Recipient : conversation.Sender;
        
        // Skip if partner doesn't match the role
        if (partner.role !== role) {
          return null;
        }

        // Get the last message
        const lastMessage = await Message.findOne({
          where: {
            type: 'user',
            [Op.or]: [
              {
                senderId: userId,
                recipientId: partnerId
              },
              {
                senderId: partnerId,
                recipientId: userId
              }
            ],
            isDeleted: false
          },
          order: [['sentDate', 'DESC'], ['sentTime', 'DESC']]
        });

        return {
          id: partner.id,
          name: partner.name,
          photo: partner.photo,
          status: partner.status,
          role: partner.role,
          lastSeen: partner.lastSeen,
          lastMessage: {
            content: lastMessage.content ? decryptMessage(lastMessage.content) : null,
            sentDate: lastMessage.sentDate,
            sentTime: lastMessage.sentTime,
            senderId: lastMessage.senderId
          }
        };
      })
    );

    // Filter out null values
    const filteredConversations = processedConversations.filter(conv => conv !== null);

    res.status(200).json({
      status: 'success',
      results: filteredConversations.length,
      data: { conversations: filteredConversations }
    });
  } catch (error) {
    console.error('Get conversations by role error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get conversations'
    });
  }
};

module.exports = {
  sendMessage,
  getUserConversation,
  getGroupConversation,
  getAllConversations,
  getConversationsByRole
};