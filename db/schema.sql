-- Drop and recreate database
DROP DATABASE IF EXISTS yum_stepper_dev;
CREATE DATABASE yum_stepper_dev;

\c yum_stepper_dev;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    points_earned INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE, -- soft delete column
    CONSTRAINT valid_latitude_users CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT valid_longitude_users CHECK (longitude BETWEEN -180 AND 180),
    CONSTRAINT points_non_negative_users CHECK (points_earned >= 0)
);

-- Create restaurants table
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    place_id VARCHAR(250),
    cuisine_type VARCHAR(250), -- Cuisine type added directly to schema
    deleted BOOLEAN DEFAULT FALSE, -- soft delete column
    CONSTRAINT valid_latitude_restaurants CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT valid_longitude_restaurants CHECK (longitude BETWEEN -180 AND 180),
    CONSTRAINT unique_place_id UNIQUE (place_id)
);

-- Create steps table
CREATE TABLE steps (
    id SERIAL PRIMARY KEY,
    step_count INTEGER NOT NULL,
    points_earned INTEGER DEFAULT 0,
    date DATE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted BOOLEAN DEFAULT FALSE, -- soft delete column
    CONSTRAINT step_points_non_negative CHECK (points_earned >= 0),
    CONSTRAINT step_count_non_negative CHECK (step_count >= 0)
);

-- Create checkins table
CREATE TABLE checkins (
    id SERIAL PRIMARY KEY,
    date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    restaurant_id INTEGER REFERENCES restaurants(id) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    receipt_image VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    distance_walked DOUBLE PRECISION,
    point_multiplier FLOAT DEFAULT 1.0,
    completion_reward_points INT DEFAULT 0,
    route_completed BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE, -- soft delete column
    CONSTRAINT valid_checkin_latitude CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT valid_checkin_longitude CHECK (longitude BETWEEN -180 AND 180),
    CONSTRAINT distance_walked_non_negative CHECK (distance_walked >= 0),
    CONSTRAINT completion_reward_points_non_negative CHECK (completion_reward_points >= 0)
);
CREATE INDEX idx_checkins_user_restaurant_date ON checkins (user_id, restaurant_id, date);

-- Create rewards table
CREATE TABLE rewards (
    id SERIAL PRIMARY KEY,
    qr_code TEXT UNIQUE NOT NULL,
    date_generated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    details VARCHAR(255) NOT NULL,
    expiration_date TIMESTAMPTZ NOT NULL,
    user_id INT REFERENCES users(id),
    restaurant_id INT REFERENCES restaurants(id) NOT NULL,
    points_required INT,
    deleted BOOLEAN DEFAULT FALSE, -- soft delete column
    CONSTRAINT points_required_non_negative CHECK (points_required >= 0)
);
CREATE INDEX idx_rewards_expiration_date ON rewards (expiration_date);

-- Create user_rewards table
CREATE TABLE user_rewards (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    reward_id INT NOT NULL REFERENCES rewards(id),
    earned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    redeemed BOOLEAN DEFAULT FALSE,
    redeemed_at TIMESTAMPTZ,
    points_required INT NOT NULL,
    expiration_date TIMESTAMPTZ NOT NULL,
    details VARCHAR(255),
    deleted BOOLEAN DEFAULT FALSE, -- soft delete column
    CONSTRAINT unique_user_reward UNIQUE (user_id, reward_id),
    CONSTRAINT redeemed_at_required CHECK (
        (redeemed = TRUE AND redeemed_at IS NOT NULL) OR
        (redeemed = FALSE AND redeemed_at IS NULL)
    )
);
CREATE INDEX idx_user_rewards_redeemed ON user_rewards (redeemed);

-- Create redemptions table
CREATE TABLE redemptions (
    id SERIAL PRIMARY KEY,
    redemption_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reward_id INT REFERENCES rewards(id),
    user_id INT REFERENCES users(id),
    deleted BOOLEAN DEFAULT FALSE -- soft delete column
);
CREATE INDEX idx_redemptions_user_reward ON redemptions (user_id, reward_id);
