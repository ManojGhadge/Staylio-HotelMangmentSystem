-- ========================================
-- Staylio Admin Database Setup Script
-- ========================================
-- This script sets up the admin user for login
-- Run this in MySQL: mysql -u root -p staylio_db < setup-admin-database.sql

-- Use the correct database
USE staylio_db;

-- ========================================
-- Step 1: Ensure admins table exists
-- ========================================
CREATE TABLE IF NOT EXISTS admins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL DEFAULT '',
    created_at DATETIME,
    updated_at DATETIME
);

-- ========================================
-- Step 2: Add password column if missing
-- ========================================
-- Check if password column exists, if not add it
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'staylio_db' 
  AND TABLE_NAME = 'admins' 
  AND COLUMN_NAME = 'password';

SET @query = IF(@col_exists = 0,
    'ALTER TABLE admins ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT ''''',
    'SELECT ''Password column already exists'' AS message');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- Step 3: Insert or Update Admin User
-- ========================================
-- Email: admin@staylio.com
-- Password: admin123
-- Password Hash (SHA-256): 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9

INSERT INTO admins (name, email, phone, password, created_at, updated_at)
VALUES (
    'Admin User',
    'admin@staylio.com',
    '+1234567890',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE 
    password = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    updated_at = NOW();

-- ========================================
-- Step 4: Verify Setup
-- ========================================
SELECT 
    '========================================' AS '';
SELECT 
    'Admin User Setup Complete!' AS 'Status';
SELECT 
    '========================================' AS '';

SELECT 
    id,
    name,
    email,
    phone,
    LEFT(password, 20) AS password_hash,
    created_at,
    updated_at
FROM admins 
WHERE email = 'admin@staylio.com';

SELECT 
    '========================================' AS '';
SELECT 
    'Login Credentials:' AS '';
SELECT 
    'Email: admin@staylio.com' AS '';
SELECT 
    'Password: admin123' AS '';
SELECT 
    '========================================' AS '';

-- ========================================
-- Additional: Show all admins (for verification)
-- ========================================
SELECT 
    'All Admins in Database:' AS '';
SELECT 
    id,
    name,
    email,
    LEFT(password, 20) AS password_hash
FROM admins;
