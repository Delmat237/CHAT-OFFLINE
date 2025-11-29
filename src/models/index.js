const User = require('./User');
const Group = require('./Group');
const Message = require('./Message');
const GroupUser = require('./GroupUser');

// Define associations
User.belongsToMany(Group, { 
  through: GroupUser,
  foreignKey: 'userId',
  otherKey: 'groupId'
});

Group.belongsToMany(User, { 
  through: GroupUser,
  foreignKey: 'groupId',
  otherKey: 'userId'
});

Group.hasMany(Message, {
  foreignKey: 'recipientId',
  constraints: false,
  scope: {
    type: 'group'
  }
});

User.hasMany(Message, {
  foreignKey: 'senderId',
  as: 'SentMessages'
});

User.hasMany(Message, {
  foreignKey: 'recipientId',
  constraints: false,
  scope: {
    type: 'user'
  },
  as: 'ReceivedMessages'
});

module.exports = {
  User,
  Group,
  Message,
  GroupUser
};