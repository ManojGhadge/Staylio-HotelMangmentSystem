-- Add test reviews for recommendation system
-- Make sure you have users and hotels in your database first

-- Sample reviews for testing the recommendation system
-- User 1 likes luxury hotels with high ratings
INSERT INTO reviews (hotel_id, user_id, rating, review_text, created_at) VALUES
(1, 1, 5, 'Excellent luxury hotel with amazing amenities!', NOW()),
(2, 1, 4, 'Great service and beautiful rooms.', NOW()),
(3, 1, 2, 'Not up to expectations, poor service.', NOW());

-- User 2 has similar taste to User 1 (for collaborative filtering)
INSERT INTO reviews (hotel_id, user_id, rating, review_text, created_at) VALUES
(1, 2, 5, 'Outstanding hotel, loved every moment!', NOW()),
(2, 2, 4, 'Very good hotel, would recommend.', NOW()),
(4, 2, 5, 'Perfect for business trips, excellent facilities.', NOW()),
(5, 2, 3, 'Average hotel, nothing special.', NOW());

-- User 3 has different preferences (budget-conscious)
INSERT INTO reviews (hotel_id, user_id, rating, review_text, created_at) VALUES
(3, 3, 4, 'Good value for money, clean rooms.', NOW()),
(5, 3, 4, 'Decent hotel for the price.', NOW()),
(6, 3, 5, 'Excellent budget option!', NOW());

-- User 4 mixed preferences
INSERT INTO reviews (hotel_id, user_id, rating, review_text, created_at) VALUES
(1, 4, 3, 'Good but overpriced.', NOW()),
(4, 4, 5, 'Amazing business hotel!', NOW()),
(6, 4, 4, 'Surprisingly good for the price.', NOW());

-- Check if reviews were inserted
SELECT 'Reviews inserted successfully' as status;
SELECT COUNT(*) as total_reviews FROM reviews;
SELECT user_id, COUNT(*) as review_count FROM reviews GROUP BY user_id;