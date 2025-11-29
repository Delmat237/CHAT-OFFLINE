# Secure Messaging Application API

A secure, real-time messaging application backend built with Node.js, Express, MySQL, and Socket.io.

## Features

- User authentication with JWT
- Real-time messaging with Socket.io
- Message encryption for secure communication
- Group management
- File attachments
- Online status and typing indicators
- Role-based user system (teachers, students, workers)

## Technologies Used

- Node.js
- Express.js
- MySQL (with Sequelize ORM)
- Socket.io for real-time communication
- JWT for authentication
- bcrypt.js for password hashing
- crypto-js for message encryption
- multer for file uploads

## Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and update the values
3. Install dependencies: `npm install`
4. Start the server: `npm run dev`

## Database Schema

The application uses the following database schema:

### Users
- id (UUID)
- name (String)
- email (String, unique)
- password (String, hashed)
- photo (String)
- role (Enum: teacher, student, worker)
- status (Enum: online, offline)
- lastSeen (DateTime)

### Groups
- id (UUID)
- name (String)
- createdBy (UUID, foreign key to Users)
- isDeleted (Boolean)
- creationDate (DateTime)
- modificationDate (DateTime)

### Messages
- id (UUID)
- type (Enum: user, group)
- senderId (UUID, foreign key to Users)
- recipientId (UUID, foreign key to Users or Groups)
- content (Text, encrypted)
- attachment (String)
- attachmentType (String)
- isDeleted (Boolean)
- sentDate (Date)
- sentTime (Time)
- modificationTime (DateTime)

### GroupUsers
- id (UUID)
- groupId (UUID, foreign key to Groups)
- userId (UUID, foreign key to Users)
- isAdmin (Boolean)
- joinedAt (DateTime)

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Log in
- POST /api/auth/logout - Log out
- PATCH /api/auth/change-password - Change password
- GET /api/auth/me - Get current user

### Users
- PATCH /api/users/update-profile - Update user profile
- GET /api/users/all - Get all users
- GET /api/users/:role - Get users by role
- GET /api/users/search - Search users

### Messages
- POST /api/messages - Send a message
- GET /api/messages/user/:userId - Get conversation with a user
- GET /api/messages/group/:groupId - Get conversation with a group
- GET /api/messages/conversations - Get all conversations
- GET /api/messages/conversations/:role - Get conversations by role

### Groups
- POST /api/groups - Create a group
- GET /api/groups/my-groups - Get current user's groups
- POST /api/groups/:groupId/members - Add members to a group
- DELETE /api/groups/:groupId/members/:memberId - Remove a member from a group
- DELETE /api/groups/:groupId - Delete a group
- GET /api/groups/search - Search groups

## Socket.io Events

### Client events
- `privateMessage` - Send a private message
- `groupMessage` - Send a group message
- `joinGroup` - Join a group room
- `leaveGroup` - Leave a group room
- `typing` - Send typing status

### Server events
- `privateMessage` - Receive a private message
- `groupMessage` - Receive a group message
- `messageSent` - Confirmation of message sent
- `userStatus` - User status changes
- `typing` - User typing status

## Security Features

- JWT authentication for API endpoints
- Password hashing with bcrypt.js
- Message content encryption with crypto-js
- HTTP security headers with helmet
- Input validation with express-validator
- CORS protection