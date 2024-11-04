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

-- Function: Calculate Check-In Points (Distance-Based)
-- Function: Calculate Check-In Points (Distance-Based)
CREATE OR REPLACE FUNCTION calculate_checkin_points() 
RETURNS TRIGGER AS $$
DECLARE
    user_lat DOUBLE PRECISION;
    user_long DOUBLE PRECISION;
    restaurant_lat DOUBLE PRECISION;
    restaurant_long DOUBLE PRECISION;
    distance_km DOUBLE PRECISION;
    distance_meters DOUBLE PRECISION;
    check_in_points INT := 10; -- Initial check-in points
    multiplier FLOAT := 1.0; -- Default multiplier
    daily_checkin_limit INT := 2;
    today_checkin_count INT;
    steps_en_route INT;
    base_step_points INT;
    multiplier_bonus_points INT;
    total_completion_points INT;
BEGIN
    RAISE NOTICE 'Calculating check-in points for user % at restaurant %', NEW.user_id, NEW.restaurant_id;

    -- Count today's check-ins for this user at this restaurant
    SELECT COUNT(*) INTO today_checkin_count
    FROM checkins
    WHERE user_id = NEW.user_id 
      AND restaurant_id = NEW.restaurant_id
      AND date_trunc('day', date) = date_trunc('day', CURRENT_TIMESTAMP);

    -- Restrict to 2 check-ins per day
    IF today_checkin_count >= daily_checkin_limit THEN
        RAISE EXCEPTION 'Daily check-in limit reached for this restaurant.';
    END IF;

    -- Use user's current location from the NEW record
    user_lat := NEW.latitude;
    user_long := NEW.longitude;

    -- Fetch restaurant location
    SELECT latitude, longitude INTO restaurant_lat, restaurant_long
    FROM restaurants WHERE id = NEW.restaurant_id;

    -- Validate user and restaurant coordinates
    IF user_lat IS NULL OR user_long IS NULL THEN
        RAISE EXCEPTION 'User location is not provided.';
    END IF;

    IF restaurant_lat IS NULL OR restaurant_long IS NULL THEN
        RAISE EXCEPTION 'Restaurant location is not found.';
    END IF;

    -- Calculate distance in kilometers using the Haversine formula
    distance_km := (
        2 * 6371 *
        ASIN(
            SQRT(
                POWER(SIN(RADIANS((restaurant_lat - user_lat) / 2)), 2) +
                COS(RADIANS(user_lat)) * COS(RADIANS(restaurant_lat)) *
                POWER(SIN(RADIANS((restaurant_long - user_long) / 2)), 2)
            )
        )
    );

    -- Convert distance to meters
    distance_meters := distance_km * 1000;

    NEW.distance_walked := distance_meters;

    -- Set check-in points based on distance in meters (No multiplier applied)
    IF distance_meters > 6436 THEN
        check_in_points := 50;
    ELSIF distance_meters > 3218 THEN
        check_in_points := 35;
    ELSIF distance_meters > 1609 THEN
        check_in_points := 25;
    ELSIF distance_meters > 805 THEN
        check_in_points := 15;
    ELSE
        check_in_points := 10; -- Default for distances less than or equal to 805 meters
    END IF;

    -- Set point multiplier based on distance in meters for the journey
    IF distance_meters > 4827 THEN
        multiplier := 3.0;
        RAISE NOTICE 'Distance over 4.8 km, multiplier set to 3x';
    ELSIF distance_meters > 3218 THEN
        multiplier := 2.0;
        RAISE NOTICE 'Distance over 3.2 km, multiplier set to 2x';
    ELSIF distance_meters > 1609 THEN
        multiplier := 1.5;
        RAISE NOTICE 'Distance over 1.6 km, multiplier set to 1.5x';
    ELSE
        multiplier := 1.0;
        RAISE NOTICE 'Distance under 1.6 km, no multiplier applied';
    END IF;

    -- Estimate steps taken during the journey (average step length = 0.762 meters)
    steps_en_route := FLOOR(distance_meters / 0.762)::INT;

    -- Calculate base step points for steps during the journey
    base_step_points := FLOOR((steps_en_route / 1000.0) * 10)::INT;

    -- Calculate multiplier bonus points based on multiplier
    multiplier_bonus_points := FLOOR(base_step_points * (multiplier - 1))::INT;

    -- Calculate total completion points: base step points + multiplier bonus points + check-in points
    total_completion_points := base_step_points + multiplier_bonus_points + check_in_points;

    -- Assign values to NEW record
    NEW.check_in_points := check_in_points;
    NEW.multiplier_points := multiplier_bonus_points;
    NEW.completion_reward_points := total_completion_points;

    -- Log points for debugging
    RAISE NOTICE 'Distance walked: % meters', distance_meters;
    RAISE NOTICE 'Estimated steps en route: %', steps_en_route;
    RAISE NOTICE 'Base step points: %', base_step_points;
    RAISE NOTICE 'Multiplier: %', multiplier;
    RAISE NOTICE 'Multiplier Bonus Points: %', multiplier_bonus_points;
    RAISE NOTICE 'Check-in points (no multiplier): %', check_in_points;
    RAISE NOTICE 'Total completion reward points: %', total_completion_points;

    -- Update user's earned points
    UPDATE users 
    SET points_earned = points_earned + NEW.completion_reward_points
    WHERE id = NEW.user_id;

    -- Log user's total points after update
    RAISE NOTICE 'User ID % total points after check-in update: %', NEW.user_id, (SELECT points_earned FROM users WHERE id = NEW.user_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate Step Points (10 points per 1,000 steps)
CREATE OR REPLACE FUNCTION calculate_step_points()
RETURNS TRIGGER AS $$
DECLARE
    step_points INT;
BEGIN
    IF NEW.step_count < 0 THEN
        RAISE EXCEPTION 'Step count cannot be negative';
    END IF;

    -- Calculate points: 10 points for every 1,000 steps
    step_points := FLOOR(NEW.step_count / 1000.0)::INT * 10;
    NEW.points_earned := step_points;

    -- Log points for debugging
    RAISE NOTICE 'Calculated Step Points: % for step count: %', step_points, NEW.step_count;

    -- Update user's total points in the users table
    UPDATE users 
    SET points_earned = points_earned + step_points
    WHERE id = NEW.user_id;

    -- Log user's total points after update
    RAISE NOTICE 'User ID % total points after step update: %', NEW.user_id, (SELECT points_earned FROM users WHERE id = NEW.user_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Limit Reward Redemptions per Month
CREATE OR REPLACE FUNCTION limit_reward_redemptions()
RETURNS TRIGGER AS $$
DECLARE
    redemption_count INT;
    current_month_start DATE := date_trunc('month', CURRENT_DATE);
    reward_points_required INT;
    points_available INT;
BEGIN
    -- Count redemptions for the current month
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

    -- Retrieve points required for the reward
    SELECT rw.points_required INTO reward_points_required
    FROM rewards rw 
    WHERE rw.id = NEW.reward_id;

    -- Retrieve user's available points
    SELECT u.points_earned INTO points_available 
    FROM users u 
    WHERE u.id = NEW.user_id;

    -- Log points for debugging
    RAISE NOTICE 'User points available: %, Reward points required: %', points_available, reward_points_required;

    -- Check if the user has enough points for this reward
    IF points_available < reward_points_required THEN
        RAISE EXCEPTION 'Insufficient points for redemption. Required: %, Available: %', reward_points_required, points_available;
    END IF;

    -- Deduct points for the reward
    UPDATE users
    SET points_earned = GREATEST(points_earned - reward_points_required, 0)
    WHERE id = NEW.user_id;

    -- Set points spent in the new redemption record
    NEW.points_spent := reward_points_required;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;





-- Function: Award Sign-Up Bonus
CREATE OR REPLACE FUNCTION award_signup_bonus()
RETURNS TRIGGER AS $$
BEGIN
    -- Award 100 points to the new user
    NEW.points_earned := 100;
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

-- Trigger: Award sign-up bonus when a new user is inserted
CREATE TRIGGER trg_award_signup_bonus
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION award_signup_bonus();
