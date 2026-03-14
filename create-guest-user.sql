-- Create a default "Guest" user for bookings without login
-- This ensures all bookings have a valid user_id

USE staylio_db;

-- First, check if guest user already exists
SELECT * FROM users WHERE email = 'guest@staylio.com';

-- If not exists, create the guest user
INSERT INTO users (name, email, password, phone, role, created_at, updated_at)
VALUES (
    'Guest User',
    'guest@staylio.com',
    '$2a$10$dummyHashForGuestUser',  -- Dummy password hash (cannot login)
    '+00000000000',
    'USER',
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE name = 'Guest User';

-- Get the guest user ID
SELECT id, name, email FROM users WHERE email = 'guest@staylio.com';

-- Now make user_id nullable (optional, for flexibility)
ALTER TABLE bookings MODIFY COLUMN user_id BIGINT NULL;
