\c yum_stepper_dev;

INSERT INTO users (username, email, password_hash, latitude, longitude, points_earned) VALUES
('KhiMesha', 'KhiM10@example.com', 'hash1', '40.7128', '-74.0060', 0),  -- Manhattan, NY
('Larrience', 'LAL817@example.com', 'hash2', '40.6782', '-73.9442', 0), -- Brooklyn, NY
('DiaMoee', 'DiaStone@example.com', 'hash3', '40.7282', '-73.7949', 0), -- Queens, NY
('Triton', 'user4@example.com', 'hash4', '40.8448', '-73.8648', 0),     -- Bronx, NY
('Nadaleesha', 'user5@example.com', 'hash5', '40.5795', '-74.1502', 0);  -- Staten Island, NY


-- Restaurants
INSERT INTO restaurants (name, latitude, longitude) VALUES
('Restaurant A', '40.730610', '-73.935242'), -- Manhattan, NY
('Restaurant B', '40.6782', '-73.9442');     -- Brooklyn, NY


INSERT INTO steps (step_count, date, user_id) VALUES
(500, '2024-09-18 09:00:00', 1),
(1200, '2024-09-18 10:00:00', 2),
(750, '2024-09-18 11:00:00', 3);

