-- Fix RLS policies for students table - remove overly permissive public access
-- The students_public view already exists for public access to limited fields

-- Drop the problematic policy that allows public access to sensitive student data
DROP POLICY IF EXISTS "Public can view basic student info via public view" ON public.students;

-- The remaining policies are appropriate:
-- "Admins and authorized staff can view students" - allows admin/teacher/accountant SELECT
-- "Admins can manage students" - allows admin ALL

-- Fix RLS policies for profiles table - restrict SELECT to own profile or admins only
-- Currently allows public SELECT which exposes email/phone

-- Drop any existing permissive SELECT policies on profiles
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.profiles;

-- Create properly restricted SELECT policy for profiles
CREATE POLICY "Users can view own profile or admins view all" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id OR is_admin(auth.uid()));