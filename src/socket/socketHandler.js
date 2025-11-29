const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { encryptMessage, decryptMessage } = require('../utils/encryption');

// Socket.io handler
const socketHandler = (io) => {
  // Store active users
  const activeUsers = new Map();
  
  // Store typing status
  const typingUsers = new Map();

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user exists
      const user = await User.findByPk(decoded.id);
      console.log("Utilisateur trouvé:", user);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: ' + error.message));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    const username = socket.user.name; // Utilise username ici
    console.log(`User ${username} connected`); // Affiche le nom d'utilisateur
  
    // Émettre un message de bienvenue au client
    socket.emit('connected', { message: 'Socket connection established' });
  
    // Ajouter l'utilisateur dans le map activeUsers avec le username comme clé
    activeUsers.set(username, socket.id);
  
    // Quand un utilisateur se déconnecte
    socket.on('disconnect', () => {
      console.log(`User ${username} disconnected`);
      activeUsers.delete(username); // Supprimer l'utilisateur de la map quand il se déconnecte

      // Remove user from typing users map
      for (const [conversationId, typingUserId] of typingUsers.entries()) {
        if (typingUserId === userId) {
          typingUsers.delete(conversationId);
        }
      }
      
      // Update user status to offline
      User.update(
        { status: 'offline', lastSeen: new Date() },
        { where: { id: userId } }
      ).catch(err => console.error('Error updating user status:', err));

      // Broadcast user offline status
      socket.broadcast.emit('userStatus', {
        userId,
        status: 'offline'
      });
    });
    

    
    // Update user status to online
    User.update(
      { status: 'online', lastSeen: new Date() },
      { where: { id: userId } }
    ).catch(err => console.error('Error updating user status:', err));

    // Broadcast user online status
    socket.broadcast.emit('userStatus', {
      userId,
      status: 'online'
    });
    socket.broadcast.emit('userStatus', {
      userId,
      status: 'online',
      message: `${socket.user.username || "Un utilisateur"} est en ligne`
    });
    
    // Listen for private messages
    socket.on('privateMessage', async (data) => {
      try {
        const { recipientId, content, attachment } = data;
        
        // Encrypt message content
        const encryptedContent = content ? encryptMessage(content) : null;
        
        // Create message data
        const messageData = {
          type: 'user',
          senderId: userId,
          recipientId,
          content: encryptedContent,
          attachment,
          sentDate: new Date(),
          sentTime: new Date().toTimeString().split(' ')[0]
        };

        // Save message to database
        // This would typically be handled by the messageController
        
        // Find the recipient's socket
        const recipientSocketId = activeUsers.get(recipientId);
        
        // If recipient is online, send them the message
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('privateMessage', {
            ...messageData,
            content // Send the original content to the recipient
          });
        }
        
        // Send confirmation back to sender
        socket.emit('messageSent', {
          success: true,
          message: messageData
        });
      } catch (error) {
        console.error('Socket private message error:', error);
        socket.emit('messageSent', {
          success: false,
          error: 'Failed to send message'
        });
      }
    });

    // Listen for group messages
    socket.on('groupMessage', async (data) => {
      try {
        const { groupId, content, attachment } = data;
        
        // Encrypt message content
        const encryptedContent = content ? encryptMessage(content) : null;
        
        // Create message data
        const messageData = {
          type: 'group',
          senderId: userId,
          recipientId: groupId,
          content: encryptedContent,
          attachment,
          sentDate: new Date(),
          sentTime: new Date().toTimeString().split(' ')[0]
        };

        // Save message to database
        // This would typically be handled by the messageController
        
        // Broadcast to all group members
        socket.to(groupId).emit('groupMessage', {
          ...messageData,
          content // Send the original content
        });
        
        // Send confirmation back to sender
        socket.emit('messageSent', {
          success: true,
          message: messageData
        });
      } catch (error) {
        console.error('Socket group message error:', error);
        socket.emit('messageSent', {
          success: false,
          error: 'Failed to send message'
        });
      }
    });

    // Join a group room
    socket.on('joinGroup', (groupId) => {
      socket.join(groupId);
    });

    // Leave a group room
    socket.on('leaveGroup', (groupId) => {
      socket.leave(groupId);
    });

    // Handle typing status
    socket.on('typing', (data) => {
      const { recipientId, isTyping } = data;
      
      // Create a unique conversation ID
      const conversationId = [userId, recipientId].sort().join('-');
      
      // Update typing status
      if (isTyping) {
        typingUsers.set(conversationId, userId);
      } else {
        if (typingUsers.get(conversationId) === userId) {
          typingUsers.delete(conversationId);
        }
      }
      
      // Find the recipient's socket
      const recipientSocketId = activeUsers.get(recipientId);
      
      // If recipient is online, send them the typing status
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing', {
          userId,
          isTyping
        });
      }
    });

    // Handle disconnect
    // socket.on('disconnect', () => {
    //   // Remove user from active users map
    //   activeUsers.delete(userId);
      
    //   // Remove user from typing users map
    //   for (const [conversationId, typingUserId] of typingUsers.entries()) {
    //     if (typingUserId === userId) {
    //       typingUsers.delete(conversationId);
    //     }
    //   }
      
    //   // Update user status to offline
    //   User.update(
    //     { status: 'offline', lastSeen: new Date() },
    //     { where: { id: userId } }
    //   ).catch(err => console.error('Error updating user status:', err));

    //   // Broadcast user offline status
    //   socket.broadcast.emit('userStatus', {
    //     userId,
    //     status: 'offline'
    //   });
    // });
  });
};

module.exports = socketHandler;