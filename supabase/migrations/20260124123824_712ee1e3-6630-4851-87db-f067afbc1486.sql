-- Fix teacher_salaries SELECT policy - was allowing ALL authenticated users
DROP POLICY IF EXISTS "Teachers can view own salary" ON public.teacher_salaries;

-- Since teachers table doesn't have a user_id column linking to auth.users,
-- we restrict salary viewing to admins and accountants only (safest approach)
CREATE POLICY "Admins and accountants can view salaries" 
ON public.teacher_salaries
FOR SELECT 
USING (
  public.is_admin(auth.uid()) OR 
  public.has_role(auth.uid(), 'accountant')
);

-- Fix sponsors table - restrict SELECT to authenticated users with appropriate roles
DROP POLICY IF EXISTS "Authenticated users can view sponsors" ON public.sponsors;

-- Only admins and accountants should see sponsor/donor details (contains PII)
CREATE POLICY "Admins and accountants can view sponsors" 
ON public.sponsors
FOR SELECT 
USING (
  public.is_admin(auth.uid()) OR 
  public.has_role(auth.uid(), 'accountant')
);

-- Verify profiles table has correct RLS - should already be restricted
-- The existing policy is: (auth.uid() = user_id) OR is_admin(auth.uid())
-- This is correct - users can only see their own profile or admins can see all