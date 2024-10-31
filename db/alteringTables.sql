\c yum_stepper_dev;

-- Add cuisine_type column to restaurants if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns 
        WHERE table_name = 'restaurants' 
        AND column_name = 'cuisine_type'
    ) THEN
        ALTER TABLE restaurants 
        ADD COLUMN cuisine_type VARCHAR(250);
    END IF;
END $$;

-- Add soft delete columns to tables if they do not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'deleted'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns 
        WHERE table_name = 'restaurants' 
        AND column_name = 'deleted'
    ) THEN
        ALTER TABLE restaurants 
        ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns 
        WHERE table_name = 'rewards' 
        AND column_name = 'deleted'
    ) THEN
        ALTER TABLE rewards 
        ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns 
        WHERE table_name = 'user_rewards' 
        AND column_name = 'deleted'
    ) THEN
        ALTER TABLE user_rewards 
        ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns 
        WHERE table_name = 'steps' 
        AND column_name = 'deleted'
    ) THEN
        ALTER TABLE steps 
        ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns 
        WHERE table_name = 'checkins' 
        AND column_name = 'deleted'
    ) THEN
        ALTER TABLE checkins 
        ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns 
        WHERE table_name = 'redemptions' 
        AND column_name = 'deleted'
    ) THEN
        ALTER TABLE redemptions 
        ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
