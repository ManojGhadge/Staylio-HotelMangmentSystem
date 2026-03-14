-- Insert demo admin user
-- Email: admin@staylio.com
-- Password: admin123 (hashed with SHA-256)

-- First, check if admin table has password column (it should after model update)
-- ALTER TABLE admins ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '';

-- Insert demo admin
-- Password 'admin123' hashed with SHA-256 = 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
INSERT INTO admins (name, email, phone, password, created_at, updated_at)
VALUES ('Admin User', 'admin@staylio.com', '+1234567890', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    password = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    updated_at = NOW();

-- Verify the insert
SELECT * FROM admins WHERE email = 'admin@staylio.com';
