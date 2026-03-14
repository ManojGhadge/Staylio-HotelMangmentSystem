-- Fix user_id to allow NULL for guest bookings
-- This allows bookings to be made without user login

USE staylio_db;

-- Make user_id nullable in bookings table
ALTER TABLE bookings 
MODIFY COLUMN user_id BIGINT NULL;

-- Verify the change
DESCRIBE bookings;

-- Show current bookings
SELECT id, user_id, guest_name, guest_email, payment_method, payment_status 
FROM bookings 
ORDER BY created_at DESC 
LIMIT 5;
