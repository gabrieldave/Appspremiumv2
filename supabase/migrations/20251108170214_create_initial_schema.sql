/*
  # Initial Schema for Premium Subscription Portal

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `subscription_status` (text) - active, inactive, cancelled
      - `stripe_customer_id` (text)
      - `stripe_subscription_id` (text)
      - `subscription_end_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `downloads`
      - `id` (uuid, primary key)
      - `version` (text) - Version number
      - `release_date` (timestamptz)
      - `notes` (text) - What's new
      - `download_url` (text)
      - `file_size` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
    
    - `premium_apps`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `image_url` (text)
      - `video_url` (text) - YouTube embed URL
      - `download_url` (text)
      - `category` (text)
      - `is_active` (boolean)
      - `sort_order` (int)
      - `created_at` (timestamptz)
    
    - `support_links`
      - `id` (uuid, primary key)
      - `platform` (text) - whatsapp, telegram, instagram, etc
      - `url` (text)
      - `icon_name` (text) - lucide icon name
      - `is_featured` (boolean)
      - `sort_order` (int)
      - `is_active` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their profile
    - Add policies for authenticated active subscribers to access content
    - Add policies for public access to support links
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  subscription_status text DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'trialing')),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Downloads table
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  release_date timestamptz DEFAULT now(),
  notes text NOT NULL,
  download_url text NOT NULL,
  file_size text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active subscribers can view downloads"
  ON downloads FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.subscription_status IN ('active', 'trialing')
    )
  );

-- Premium Apps table
CREATE TABLE IF NOT EXISTS premium_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  video_url text,
  download_url text NOT NULL,
  category text DEFAULT '',
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE premium_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active subscribers can view premium apps"
  ON premium_apps FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.subscription_status IN ('active', 'trialing')
    )
  );

-- Support Links table
CREATE TABLE IF NOT EXISTS support_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  url text NOT NULL,
  icon_name text NOT NULL,
  is_featured boolean DEFAULT false,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active subscribers can view support links"
  ON support_links FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.subscription_status IN ('active', 'trialing')
    )
  );

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_downloads_active ON downloads(is_active, release_date DESC);
CREATE INDEX IF NOT EXISTS idx_premium_apps_active ON premium_apps(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_support_links_active ON support_links(is_active, sort_order);
