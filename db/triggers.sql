\c yum_stepper_dev;

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS trg_calculate_checkin_points ON checkins;
DROP TRIGGER IF EXISTS trg_limit_reward_redemptions ON redemptions;
DROP TRIGGER IF EXISTS trg_calculate_step_points ON steps;
DROP FUNCTION IF EXISTS calculate_checkin_points();
DROP FUNCTION IF EXISTS limit_reward_redemptions();
DROP FUNCTION IF EXISTS calculate_step_points();

-- Function: Calculate Check-In Points (Distance-Based)
CREATE OR REPLACE FUNCTION calculate_checkin_points() 
RETURNS TRIGGER AS $$
DECLARE
    user_lat DOUBLE PRECISION;
    user_long DOUBLE PRECISION;
    restaurant_lat DOUBLE PRECISION;
    restaurant_long DOUBLE PRECISION;
    distance DOUBLE PRECISION;
    base_points INT := 10; -- Base points for short distances
    check_in_points INT := 10; -- Initial check-in points for short distances
    multiplier FLOAT := 1.0; -- Default multiplier
BEGIN
    -- Fetch user location
    SELECT latitude, longitude INTO user_lat, user_long 
    FROM users WHERE id = NEW.user_id;

    -- Fetch restaurant location
    SELECT latitude, longitude INTO restaurant_lat, restaurant_long
    FROM restaurants WHERE id = NEW.restaurant_id;

    -- Calculate distance using the Haversine formula
    distance := (
        2 * 6371 *
        ASIN(
            SQRT(
                POWER(SIN(RADIANS((restaurant_lat - user_lat) / 2)), 2) +
                COS(RADIANS(user_lat)) * COS(RADIANS(restaurant_lat)) *
                POWER(SIN(RADIANS((restaurant_long - user_long) / 2)), 2)
            )
        )
    );

    NEW.distance_walked := distance;

    -- Set check-in points based on distance
    IF distance > 6436 THEN
        check_in_points := 50;
    ELSIF distance > 3218 THEN
        check_in_points := 35;
    ELSIF distance > 1609 THEN
        check_in_points := 25;
    ELSIF distance > 805 THEN
        check_in_points := 15;
    END IF;

    -- Set point multiplier based on distance
    IF distance <= 1 THEN
        multiplier := 1.0;
    ELSIF distance > 1 AND distance <= 2 THEN
        multiplier := 1.5;
    ELSIF distance > 2 AND distance <= 3 THEN
        multiplier := 2.0;
    ELSE
        multiplier := 3.0;
    END IF;

    -- Log distance, check-in points, multiplier, and base points
    RAISE NOTICE 'Distance: %, Check-In Points: %, Multiplier: %, Base Points: %', distance, check_in_points, multiplier, base_points;

    -- Calculate completion points
    NEW.completion_reward_points := check_in_points + FLOOR(base_points * multiplier)::INT;

    -- Log calculated completion_reward_points
    RAISE NOTICE 'Calculated Total Points (completion_reward_points): %', NEW.completion_reward_points;

    -- Update user's earned points
    UPDATE users 
    SET points_earned = points_earned + NEW.completion_reward_points
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate Step Points (10 points per 1,000 steps)
CREATE OR REPLACE FUNCTION calculate_step_points()
RETURNS TRIGGER AS $$
DECLARE
    step_points INT;
BEGIN
    -- Calculate points: 10 points for every 1,000 steps
    step_points := (NEW.step_count / 1000) * 10;

    -- Update points earned for the step entry
    NEW.points_earned := step_points;

    -- Log calculated points for debugging
    RAISE NOTICE 'Step Count: %, Points Earned: %', NEW.step_count, step_points;

    -- Update user's total points in the users table
    UPDATE users 
    SET points_earned = points_earned + step_points
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Limit Reward Redemptions per Month
CREATE OR REPLACE FUNCTION limit_reward_redemptions()
RETURNS TRIGGER AS $$
DECLARE
    redemption_count INT;
    current_month_start DATE := date_trunc('month', CURRENT_DATE);
BEGIN
    -- Count redemptions in the current month
    SELECT COUNT(*) INTO redemption_count
    FROM redemptions
    WHERE user_id = NEW.user_id
        AND reward_id = NEW.reward_id
        AND redemption_date >= current_month_start
        AND redemption_date < (current_month_start + INTERVAL '1 month');

    -- Limit to 3 redemptions per month
    IF redemption_count >= 3 THEN
        RAISE EXCEPTION 'Monthly redemption limit reached for this reward.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Apply check-in point calculation before inserting into checkins
CREATE TRIGGER trg_calculate_checkin_points
BEFORE INSERT ON checkins
FOR EACH ROW
EXECUTE FUNCTION calculate_checkin_points();

-- Trigger: Apply step points calculation before inserting into steps
CREATE TRIGGER trg_calculate_step_points
BEFORE INSERT ON steps
FOR EACH ROW
EXECUTE FUNCTION calculate_step_points();

-- Trigger: Limit reward redemptions per user per month in redemptions
CREATE TRIGGER trg_limit_reward_redemptions
BEFORE INSERT ON redemptions
FOR EACH ROW
EXECUTE FUNCTION limit_reward_redemptions();
