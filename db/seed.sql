\c yum_stepper_dev;

INSERT INTO users (username, email, password_hash, latitude, longitude, points_earned) VALUES
('KhiMesha', 'KhiM10@example.com', 'hash1', '40.7128', '-74.0060', 0),
('Larrience', 'LAL817@example.com', 'hash2', '34.0522', '-118.2437', 0),
('DiaMoee', 'DiaStone@example.com', 'hash3', '37.7749', '-122.4194', 0),
('Triton', 'user4@example.com', 'hash4', '51.5074', '-0.1278', 0),
('Nadaleesha', 'user5@example.com', 'hash5', '48.8566', '2.3522', 0);

-- Restaurants
INSERT INTO restaurants (name, latitude, longitude) VALUES
('Restaurant A', '40.730610', '-73.935242'),
('Restaurant B', '34.052235', '-118.243683');

INSERT INTO steps (step_count, date, user_id) VALUES
(500, '2024-09-18 09:00:00', 1),
(1200, '2024-09-18 10:00:00', 2),
(750, '2024-09-18 11:00:00', 3);

