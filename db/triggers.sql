-- Connect to your database
\c yum_stepper_dev;


-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS trg_calculate_checkin_points ON checkins;
DROP TRIGGER IF EXISTS trg_limit_reward_redemptions ON redemptions;
DROP TRIGGER IF EXISTS trg_calculate_step_points ON steps;
DROP TRIGGER IF EXISTS trg_award_signup_bonus ON users;

DROP FUNCTION IF EXISTS calculate_checkin_points();
DROP FUNCTION IF EXISTS limit_reward_redemptions();
DROP FUNCTION IF EXISTS calculate_step_points();
DROP FUNCTION IF EXISTS award_signup_bonus();

-- Ensure the 'points_earned' column exists in 'steps' table
ALTER TABLE steps ADD COLUMN IF NOT EXISTS points_earned INT DEFAULT 0;

-- Function: Calculate Check-In Points (Distance-Based)
CREATE OR REPLACE FUNCTION calculate_checkin_points() 
RETURNS TRIGGER AS $$
DECLARE
    user_lat DOUBLE PRECISION;
    user_long DOUBLE PRECISION;
    restaurant_lat DOUBLE PRECISION;
    restaurant_long DOUBLE PRECISION;
    distance DOUBLE PRECISION := 0.0;
    distance_km DOUBLE PRECISION := 0.0;
    distance_meters DOUBLE PRECISION := 0.0;
    check_in_points INT := 10;
    multiplier FLOAT := 1.0;
    daily_checkin_limit INT := 2;
    today_checkin_count INT := 0;
BEGIN
    RAISE NOTICE 'Calculating check-in points for user % at restaurant %', NEW.user_id, NEW.restaurant_id;

    -- Count today's check-ins for this user at this restaurant
    SELECT COUNT(*) INTO today_checkin_count
    FROM checkins
    WHERE user_id = NEW.user_id 
        AND restaurant_id = NEW.restaurant_id
        AND date_trunc('day', created_at) = CURRENT_DATE;

    IF today_checkin_count >= daily_checkin_limit THEN
        RAISE EXCEPTION 'Daily check-in limit reached for this restaurant.';
    END IF;

    -- Fetch restaurant coordinates
    SELECT latitude, longitude INTO restaurant_lat, restaurant_long
    FROM restaurants WHERE id = NEW.restaurant_id;

    -- Validate coordinates
    IF NEW.latitude IS NULL OR NEW.longitude IS NULL THEN
        RAISE EXCEPTION 'User location is required for check-in.';
    END IF;

    IF restaurant_lat IS NULL OR restaurant_long IS NULL THEN
        RAISE EXCEPTION 'Restaurant location is not found.';
    END IF;

    -- Calculate distance using Haversine formula
    distance_km := (
        2 * 6371 *
        ASIN(
            SQRT(
                POWER(SIN(RADIANS((restaurant_lat - NEW.latitude) / 2)), 2) +
                COS(RADIANS(NEW.latitude)) * COS(RADIANS(restaurant_lat)) *
                POWER(SIN(RADIANS((restaurant_long - NEW.longitude) / 2)), 2)
            )
        )
    );

    distance_meters := COALESCE(distance_km * 1000, 0.0);
    NEW.distance_walked := distance_meters;

    -- Set points based on distance
    IF distance_meters > 6436 THEN
        check_in_points := 50;
        multiplier := 3.0;
    ELSIF distance_meters > 3218 THEN
        check_in_points := 35;
        multiplier := 2.0;
    ELSIF distance_meters > 1609 THEN
        check_in_points := 25;
        multiplier := 1.5;
    ELSIF distance_meters > 805 THEN
        check_in_points := 15;
        multiplier := 1.5;
    ELSE
        -- For distances less than or equal to 805 meters
        check_in_points := 10;
        multiplier := 1.0;
    END IF;

    -- Calculate total points
    NEW.check_in_points := check_in_points;
    NEW.multiplier_points := FLOOR(check_in_points * (multiplier - 1));
    NEW.completion_reward_points := NEW.check_in_points + NEW.multiplier_points;
    NEW.points_earned := NEW.completion_reward_points;

    -- Update user's total points
    UPDATE users SET points_earned = points_earned + NEW.points_earned WHERE id = NEW.user_id;

    RAISE NOTICE 'Check-in points: %, Multiplier: %, Total points: %', NEW.check_in_points, multiplier, NEW.points_earned;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate Step Points
CREATE OR REPLACE FUNCTION calculate_step_points()
RETURNS TRIGGER AS $$
DECLARE
    old_points_earned INT := 0;
BEGIN
    IF NEW.step_count < 0 THEN
        RAISE EXCEPTION 'Step count cannot be negative.';
    END IF;

    -- Calculate step points
    NEW.points_earned := FLOOR(NEW.step_count / 1000.0) * 10;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.points_earned IS NOT NULL THEN
            old_points_earned := OLD.points_earned;
        END IF;

    -- Update user's total points
    UPDATE users 
    SET points_earned = points_earned - old_points_earned + NEW.points_earned 
    WHERE id = NEW.user_id;
ELSE
    UPDATE users
    SET points_earned = points_earned + NEW.points_earned
    WHERE id = NEW.user_id;
END IF;

    RAISE NOTICE 'Step points: %, Total user points: %', NEW.points_earned, (SELECT points_earned FROM users WHERE id = NEW.user_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Limit Reward Redemptions
CREATE OR REPLACE FUNCTION limit_reward_redemptions()
RETURNS TRIGGER AS $$
DECLARE
    redemption_count INT;
    reward_points_required INT;
    points_available INT;
BEGIN
    -- Get monthly redemption count
    SELECT COUNT(*) INTO redemption_count
    FROM redemptions
    WHERE user_id = NEW.user_id
        AND reward_id = NEW.reward_id
        AND date_trunc('month', redemption_date) = date_trunc('month', CURRENT_DATE);

    IF redemption_count >= 3 THEN
        RAISE EXCEPTION 'Monthly redemption limit reached for this reward.';
    END IF;

    -- Check user points
    SELECT points_required INTO reward_points_required FROM rewards WHERE id = NEW.reward_id;
    SELECT points_earned INTO points_available FROM users WHERE id = NEW.user_id;

    IF points_available < reward_points_required THEN
        RAISE EXCEPTION 'Insufficient points. Required: %, Available: %', reward_points_required, points_available;
    END IF;

    -- Deduct points
    UPDATE users SET points_earned = points_earned - reward_points_required WHERE id = NEW.user_id;

    NEW.points_spent := reward_points_required;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Award Sign-Up Bonus
CREATE OR REPLACE FUNCTION award_signup_bonus()
RETURNS TRIGGER AS $$
BEGIN
    NEW.points_earned := 100;

    UPDATE users SET points_earned = points_earned + NEW.points_earned WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trg_calculate_checkin_points
BEFORE INSERT ON checkins
FOR EACH ROW
EXECUTE FUNCTION calculate_checkin_points();

CREATE TRIGGER trg_calculate_step_points
BEFORE INSERT OR UPDATE ON steps
FOR EACH ROW
EXECUTE FUNCTION calculate_step_points();

CREATE TRIGGER trg_limit_reward_redemptions
BEFORE INSERT ON redemptions
FOR EACH ROW
EXECUTE FUNCTION limit_reward_redemptions();

CREATE TRIGGER trg_award_signup_bonus
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION award_signup_bonus();

-- Add the generated checkin_date column to checkins
ALTER TABLE checkins
ADD COLUMN IF NOT EXISTS checkin_date DATE;

-- Create trigger function to set checkin_date
CREATE OR REPLACE FUNCTION set_checkin_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.checkin_date := NEW.created_at::date;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create tigger to set checkin date before insert or udpate
CREATE TRIGGER trg_set_checkin_date
BEFORE INSERT OR UPDATE ON checkins
FOR EACH ROW 
EXECUTE FUNCTION set_checkin_date();

-- Add the unique constraint to prevent duplicate check-ins per day
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'unique_user_restaurant_checkin_date'
            AND table_name = 'checkins'
    ) THEN
        ALTER TABLE checkins
        ADD CONSTRAINT unique_user_restaurant_checkin_date
        UNIQUE (user_id, restaurant_id, checkin_date);
    END IF;
END;
$$;