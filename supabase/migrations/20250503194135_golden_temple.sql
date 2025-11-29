-- Insert test users
INSERT INTO Users (id, name, email, password, role, status, createdAt, updatedAt) VALUES
(UUID(), 'John Teacher', 'teacher1@example.com', '$2a$10$XgXB8p6VXdzB2YqgT9QFd.LZLJZgXqPH0VH5ZF1OJ9GlLk.ZT9Fi2', 'teacher', 'offline', NOW(), NOW()),
(UUID(), 'Mary Student', 'student1@example.com', '$2a$10$XgXB8p6VXdzB2YqgT9QFd.LZLJZgXqPH0VH5ZF1OJ9GlLk.ZT9Fi2', 'student', 'offline', NOW(), NOW()),
(UUID(), 'Bob Worker', 'worker1@example.com', '$2a$10$XgXB8p6VXdzB2YqgT9QFd.LZLJZgXqPH0VH5ZF1OJ9GlLk.ZT9Fi2', 'worker', 'offline', NOW(), NOW());

-- Insert test groups
INSERT INTO Groups (id, name, createdBy, isDeleted, creationDate, modificationDate) VALUES
(UUID(), 'Math Class', (SELECT id FROM Users WHERE email = 'teacher1@example.com'), false, NOW(), NOW()),
(UUID(), 'Staff Room', (SELECT id FROM Users WHERE email = 'worker1@example.com'), false, NOW(), NOW());

-- Add users to groups
INSERT INTO GroupUsers (id, groupId, userId, isAdmin, joinedAt) 
SELECT 
    UUID(),
    g.id,
    u.id,
    CASE WHEN u.email = 'teacher1@example.com' THEN true ELSE false END,
    NOW()
FROM Groups g
CROSS JOIN Users u
WHERE g.name = 'Math Class'
AND u.email IN ('teacher1@example.com', 'student1@example.com');