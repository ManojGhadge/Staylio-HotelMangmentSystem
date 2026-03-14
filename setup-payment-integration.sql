-- SQL Script to add payment fields to bookings table
-- Run this script to update your database for Razorpay payment integration

USE staylio_db;

-- Add payment-related columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS hotel_owner_id BIGINT AFTER hotel_id,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) AFTER special_requests,
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255) AFTER payment_method,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) AFTER razorpay_payment_id;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_owner ON bookings(hotel_owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_razorpay_payment ON bookings(razorpay_payment_id);

-- Update existing bookings to have default payment status
UPDATE bookings 
SET payment_status = 'PAY_AT_HOTEL', 
    payment_method = 'pay_at_hotel'
WHERE payment_status IS NULL;

-- Verify the changes
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'staylio_db' 
  AND TABLE_NAME = 'bookings'
  AND COLUMN_NAME IN ('hotel_owner_id', 'payment_method', 'razorpay_payment_id', 'payment_status');

SELECT 'Payment integration database setup completed successfully!' AS Status;
