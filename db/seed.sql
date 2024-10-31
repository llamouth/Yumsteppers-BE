-- seed.sql

-- Insert sample users
INSERT INTO users (username, email, password_hash, latitude, longitude, points_earned) VALUES
('KhiMesha', 'KhiM10@example.com', 'hash1', 40.7128, -74.0060, 0),
('Larrience', 'LAL817@example.com', 'hash2', 40.6782, -73.9442, 0),
('DiaMoee', 'DiaStone@example.com', 'hash3', 40.7282, -73.7949, 0),
('Triton', 'user4@example.com', 'hash4', 40.8448, -73.8648, 0),
('Nadaleesha', 'user5@example.com', 'hash5', 40.5795, -74.1502, 0);

-- Insert sample restaurants
INSERT INTO restaurants (name, latitude, longitude, place_id) VALUES
('Sakeel', 40.73078, -73.93527, 'ChIJNVA_WwBfwokRYppkSvWUWGg'),
('Cmani''s Delights', 40.67830, -73.94415, 'ChIJiybhdABbwokRH_VMM1h-kf8'),
('Motel No Tell', 40.729736, -73.980606, 'ChIJqTZuJztZwokREqOEPG7VOSM'),
('Urgut Osh Markazi', 40.63773610462734, -73.96856267997956, 'ChIJB4r6TTJbwokRs_DhuddzoLQ');

-- Insert sample steps
INSERT INTO steps (step_count, date, user_id) VALUES
(500, '2024-09-18', 1),
(1200, '2024-09-18', 2),
(750, '2024-09-18', 3);

-- Insert sample rewards
-- Insert sample rewards with correct restaurant IDs
INSERT INTO rewards (qr_code, details, expiration_date, restaurant_id, points_required) VALUES
('qr_code_1', '10% Off Next Purchase', '2024-12-31', 1, 100),
('qr_code_2', 'Free Coffee with Breakfast', '2024-12-31', 2, 150),
('qr_code_3', '20% Discount', '2024-12-31', 1, 200),  
('qr_code_4', 'Free Dessert with Meal', '2024-12-31', 4, 250),
('qr_code_5', 'Buy One Get One Free', '2024-12-31', 3, 300),
('qr_code_6', '30% Off Dinner', '2025-01-15', 2, 350),
('qr_code_7', 'Free Appetizer', '2025-01-15', 1, 50),
('qr_code_8', 'Double Points Today', '2024-10-31', 3, 0); 



