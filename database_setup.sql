-- ================================================
-- Supabase Database Schema for Authentication
-- Run these commands in your Supabase SQL Editor
-- ================================================

-- 1. Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_method VARCHAR(10) NOT NULL CHECK (auth_method IN ('google', 'email')),
  
  -- Google OAuth fields
  google_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  email_verified BOOLEAN DEFAULT false,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name VARCHAR(200),
  profile_image_url TEXT,
  
  -- Email signup fields  
  password_hash VARCHAR(255), -- NULL for Google users
  
  -- Pet information fields
  pet_name VARCHAR(100),
  pet_breed VARCHAR(100),
  pet_age INTEGER,
  pet_gender VARCHAR(20),
  
  -- System fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- 2. Create sessions table for secure session storage
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR(255) PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 3. Create index on sessions expire column for cleanup
CREATE INDEX IF NOT EXISTS sessions_expire_idx ON sessions (expire);

-- 4. Update history table to reference users properly
-- First, add foreign key constraint (the user_id column already exists)
ALTER TABLE history 
ADD CONSTRAINT fk_history_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 5. Update cases table to reference users
ALTER TABLE cases 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS users_google_id_idx ON users (google_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE INDEX IF NOT EXISTS users_auth_method_idx ON users (auth_method);
CREATE INDEX IF NOT EXISTS history_user_id_idx ON history (user_id);
CREATE INDEX IF NOT EXISTS cases_user_id_idx ON cases (user_id);

-- 7. Enable Row Level Security (RLS) for privacy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies (users can only see their own data)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users  
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own history" ON history
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own cases" ON cases
  FOR ALL USING (auth.uid()::text = user_id::text);

-- 9. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create trigger to automatically update updated_at on users table
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- IMPORTANT: Run this SQL in your Supabase Dashboard
-- 1. Go to your Supabase project
-- 2. Navigate to SQL Editor  
-- 3. Paste and run this entire script
-- ================================================