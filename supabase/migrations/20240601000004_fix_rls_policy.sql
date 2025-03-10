-- Disable RLS for users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- In case we need to enable it later with proper policies
-- Create policies that allow operations on the users table
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;
CREATE POLICY "Service role can manage all users"
  ON public.users
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Enable realtime for users table
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
