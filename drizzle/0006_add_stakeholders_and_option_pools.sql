DO $$ BEGIN
    CREATE TYPE stakeholder_role AS ENUM ('FOUNDER', 'ADVISOR');
    CREATE TYPE vesting_schedule_type AS ENUM ('STANDARD_4_YEARS', 'CUSTOM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS stakeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role stakeholder_role NOT NULL,
    title VARCHAR(100) NOT NULL,
    shares_granted INTEGER NOT NULL,
    vesting_schedule JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS option_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    total_shares INTEGER NOT NULL,
    shares_allocated INTEGER NOT NULL DEFAULT 0,
    shares_available INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS option_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID NOT NULL REFERENCES option_pools(id) ON DELETE CASCADE,
    recipient_name VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    shares_granted INTEGER NOT NULL,
    vesting_schedule JSONB NOT NULL,
    exercise_price INTEGER NOT NULL,
    grant_date TIMESTAMP NOT NULL,
    expiration_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
); 