-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS calculate_checkin_points();

-- Create or replace the function
CREATE OR REPLACE FUNCTION calculate_checkin_points() 
RETURNS TRIGGER AS $$
DECLARE
    user_lat DOUBLE PRECISION; -- changed value because of change in schema
    user_long DOUBLE PRECISION;
    restaurant_lat DOUBLE PRECISION;
    restaurant_long DOUBLE PRECISION;
    distance DOUBLE PRECISION;
    base_points INT := 25; -- Base points for check-in
BEGIN
    -- Get user's location
    SELECT latitude, longitude INTO user_lat, user_long 
    FROM users WHERE id = NEW.user_id;

    -- Get restaurant's location
    SELECT latitude, longitude INTO restaurant_lat, restaurant_long
    FROM restaurants WHERE id = NEW.restaurant_id;

    -- Check if user or restaurant locations are NULL
    IF user_lat IS NULL OR user_long IS NULL THEN
        RAISE EXCEPTION 'User location is not available';
    END IF;

    IF restaurant_lat IS NULL OR restaurant_long IS NULL THEN
        RAISE EXCEPTION 'Restaurant location is not available';
    END IF;

    -- Calculate distance using the Haversine formula (in kilometers)
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

    -- Set calculated in distance_walked field
    NEW.distance_walked := distance;

    -- Determine point multiplier based on distance
    IF distance <= 1 THEN
        NEW.point_multiplier := 1.0;
    ELSIF distance > 1 AND distance <= 2 THEN
        NEW.point_multiplier := 1.5;
    ELSIF distance > 2 AND distance <= 3 THEN
        NEW.point_multiplier := 2.0;
    ELSE
        NEW.point_multiplier := 3.0;
    END IF;

    -- Calculate total points
    NEW.completion_reward_points := (base_points * NEW.point_multiplier)::INT;

    -- Update user's points only 
    UPDATE users 
    SET points_earned = points_earned + NEW.completion_reward_points
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS limit_reward_redemptions();

-- Create or replace the function to limit number of redemptions
CREATE OR REPLACE FUNCTION limit_reward_redemptions()
RETURNS TRIGGER AS $$
DECLARE
    redemption_count INT;
    current_month_start DATE := date_trunc('month', CURRENT_DATE);
BEGIN
    -- count existing redemptions for this user and reward this current month
    SELECT COUNT(*) INTO redemption_count
    FROM redemptions
    WHERE user_id = NEW.user_id
        AND reward_id = NEW.reward_id
        AND redemption_date >= current_month_start
        AND redemption_date < (current_month_start + INTERVAL '1 month');

    -- check if the count is already 3 or more
    IF redemption_count >= 3 THEN
        RAISE EXCEPTION 'Monthly Redemption limit reached: User % has already redeemed Reward % 3 times this month.', NEW.user_id, NEW.reward_id;
    END IF;

    -- if limit not reached, allow the insertion
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for calculate_checkin_points only if the table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'checkins') THEN
        -- Drop the trigger if it exists to avoid duplication 
        DROP TRIGGER IF EXISTS trg_calculate_checkin_points ON checkins;

        -- Create the trigger
        CREATE TRIGGER trg_calculate_checkin_points
        BEFORE INSERT ON checkins
        FOR EACH ROW
        EXECUTE FUNCTION calculate_checkin_points();
    END IF;
END $$;

-- Create the trigger for limit_reward_redemptions only if the table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'redemptions') THEN
        -- Drop the trigger if it exists to avoid duplication 
        DROP TRIGGER IF EXISTS trg_limit_reward_redemptions ON redemptions;

        -- Create the trigger
        CREATE TRIGGER trg_limit_reward_redemptions
        BEFORE INSERT ON redemptions
        FOR EACH ROW
        EXECUTE FUNCTION limit_reward_redemptions();
    END IF;
END $$;
