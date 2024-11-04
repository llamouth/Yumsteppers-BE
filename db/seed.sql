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
('Urgut Osh Markazi', 40.63773610462734, -73.96856267997956, 'ChIJB4r6TTJbwokRs_DhuddzoLQ'),
('Brooklyn Tea', 40.68222084203153, -73.93466315572044, 'ChIJV5_ASAVbwokRWQYGMjU-63c'),

('The Original Chinatown Ice Cream Factory', 40.71582760677943, -73.99810562349703, 'ChIJX6BlAidawokRJ-4Jb4Bo8Vk'),
('Golden Unicorn', 40.713928273203386, -73.99720373209442, 'ChIJXczCZSZawokRerIzds-K5e0'),
('George''s', 40.70799309698635, -74.01349213209478, 'ChIJtVcN3BBawokRfYHdSkgPmwY'),
('Cornbread Brooklyn', 40.67073199589694, -73.95454220511186, 'ChIJR_ch0LxbwokRXouTAZGjl7A'),
('Sisters', 40.683048626833724, -73.96521840326007, 'ChIJi73FVqNbwokRZ4KIqLtNoFw'),

('Pig & Butter', 40.723512618328535, -73.98289576512039, 'ChIJQTLkJRdZwokRHqE4jIcLljU'),
('SoulKofa Vegan Restaurant & Catering', 40.681764510867886, -73.9222711474396, 'ChIJ0frHwtldwokRfBxhZiKgASY'),
('Cadence', 40.72690076754995, -73.98456599161679, 'ChIJqWOfDa9ZwokR8S9r58dyv5Y'),
('Spicy Moon - Bowery', 40.7235630585376, -73.99246770682294, 'ChIJAb8jiJZZwokROX7aeBYf2I4'),

('Casa Adela',40.72277259382127, -73.97973533394527, 'ChIJ5xneO3FZwokRyyN-P0ch-Wo'),
('Maisonetta', 40.80885290086529, -73.92913207441806, 'ChIJ6ZxdNlX1wokRtDoCPt_Iy4I'),
('Yukka', 40.90664897020745, -73.9039278234364, 'ChIJm-_qK0zywokRRRqGnol2dtY'),
('The Vegan Factory',40.84106135873352, -73.86541767283748, 'ChIJj3vqsWP1wokRCWOPs2od-ac'),
('Just Made 4 U',40.74992083275318, -73.88551855907735, 'ChIJB9oZ9KhfwokRjzTSutN36B4'),

('SluttyVegan Brooklyn',40.69156219658806, -73.97235712734069, 'ChIJj1LEtLFbwokROxsCqsN6qBs'),
('Akara House', 40.68297115773086, -73.94901118045132, 'ChIJLcGkKiRbwokR6xWIIP4knPE'),
('Benares',40.715190409729864, -74.00907975458352, 'ChIJ6e4q1BhawokRWWDyNSiQ4yo');






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
('qr_code_7', 'Free Appetizer', '2025-01-15', 1, 110),
('qr_code_8', 'Double Points Today', '2024-11-30', 5, 0); 





