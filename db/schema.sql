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
    points_earned INT
);

CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude VARCHAR(255) NOT NULL,
    longitude VARCHAR(255) NOT NULL,
);

CREATE TABLE steps (
    id SERIAL PRIMARY KEY,
    step_count INTEGER NOT NULL,
    points_earned INTEGER DEFAULT 0,
    date TIMESTAMP NOT NULL,
    user_id INT REFERENCES users (id) ON DELETE CASCADE 
);

CREATE TABLE checkins ( 
    id SERIAL PRIMARY KEY, 
    date TIMESTAMP NOT NULL,
    restaurant_id INTEGER REFERENCES restaurants (id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users (id) ON DELETE,
    receipt_image VARCHAR(255)
);

CREATE TABLE rewards (
    id SERIAL PRIMARY KEY,
    qr_code VARCHAR(255) NOT NULL,
    date_generated TIMESTAMP NOT NULL,
    expiration_date TIMESTAMP NOT NULL,
    user_id INT REFERENCES users (id) ON DELETE CASCADE,
    restaurant_id INT REFERENCES restaurant (id) ON DELETE CASCADE,
);