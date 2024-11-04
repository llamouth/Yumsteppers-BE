\c yum_stepper_dev;

-- Ensure columns exist in each table before altering them
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS restaurants ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS rewards ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS user_rewards ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS steps ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS checkins ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS redemptions ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;

-- Add cuisine_type column to restaurants if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'restaurants' 
          AND column_name = 'cuisine_type'
    ) THEN
        ALTER TABLE restaurants ADD COLUMN cuisine_type VARCHAR(250);
    END IF;
END $$;
