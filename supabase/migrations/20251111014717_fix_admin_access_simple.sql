/*
  # Fix admin access - simple and clear
  
  Allows users to read their own profile, OR allows admins to read ANY profile
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can read profiles" ON profiles;

-- Policy 1: Users can always read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 2: Admins can read any profile (check if current user's profile has is_admin=true)
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_app_meta_data->>'is_admin' = 'true'
    )
  );
