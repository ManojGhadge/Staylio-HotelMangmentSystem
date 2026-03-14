-- Hotel Claiming System Database Setup
-- Run this script to add hotel claiming functionality

-- Step 1: Add hotel_owner_id column to hotels table
ALTER TABLE hotels ADD COLUMN hotel_owner_id BIGINT NULL;
ALTER TABLE hotels ADD CONSTRAINT fk_hotel_owner FOREIGN KEY (hotel_owner_id) REFERENCES hosts(id) ON DELETE SET NULL;

-- Step 2: Create hotel_claims table
CREATE TABLE IF NOT EXISTS hotel_claims (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    host_id BIGINT NOT NULL,
    hotel_id BIGINT NOT NULL,
    business_name VARCHAR(255),
    claim_reason TEXT NOT NULL,
    association_details TEXT NOT NULL,
    contact_details VARCHAR(255) NOT NULL,
    document_urls TEXT,
    government_id_url VARCHAR(500),
    additional_proof TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
    rejection_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
    INDEX idx_host_id (host_id),
    INDEX idx_hotel_id (hotel_id),
    INDEX idx_status (status)
);

-- Step 3: Add indexes for better query performance
CREATE INDEX idx_hotel_owner_id ON hotels(hotel_owner_id);

-- Verify the changes
SELECT 'Hotel claiming system tables created successfully!' AS status;
