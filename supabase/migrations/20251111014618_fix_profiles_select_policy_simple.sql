/*
  # Fix profiles SELECT policy - simple approach
  
  Removes all SELECT policies and creates one simple policy:
  Users can read their own profile OR all profiles if they are admin
*/

-- Drop all SELECT policies
DROP POLICY IF EXISTS "Admins can read all profiles v2" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Create a single simple policy that handles both cases
CREATE POLICY "Users can read profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR 
    is_admin = true
  );
