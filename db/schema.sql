DROP DATABASE IF EXISTS yum_stepper_dev;
CREATE DATABASE yum_stepper_dev;

\c yum_stepper_dev;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    latitude VARCHAR(255),
    longitude VARCHAR(255),
    points_earned INT DEFAULT 0 
);

CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude VARCHAR(255) NOT NULL,
    longitude VARCHAR(255) NOT NULL,
    place_id VARCHAR(250)
);

CREATE TABLE steps (
    id SERIAL PRIMARY KEY,
    step_count INTEGER NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id INT REFERENCES users (id) ON DELETE CASCADE 
);

CREATE TABLE checkins ( 
    id SERIAL PRIMARY KEY, 
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    restaurant_id INTEGER REFERENCES restaurants (id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER REFERENCES users (id) ON DELETE CASCADE NOT NULL,
    receipt_image VARCHAR(255),
    latitude VARCHAR(255),
    longitude VARCHAR(255)
);

CREATE TABLE rewards (
    id SERIAL PRIMARY KEY,
    qr_code TEXT NOT NULL,
    date_generated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    details VARCHAR(255) NOT NULL,
    expiration_date TIMESTAMP NOT NULL,
    user_id INT REFERENCES users (id) ON DELETE CASCADE,
    restaurant_id INT REFERENCES restaurants (id) ON DELETE CASCADE NOT NULL
);

CREATE TABLE redemptions ( 
    id SERIAL PRIMARY KEY,
    redemption_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reward_id INT REFERENCES rewards (id) ON DELETE CASCADE,
    user_id INT REFERENCES users (id) ON DELETE CASCADE
);
