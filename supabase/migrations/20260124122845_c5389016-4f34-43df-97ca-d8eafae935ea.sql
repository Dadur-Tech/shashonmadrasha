-- Security Fix Migration: Address Error-Level Security Issues
-- 1. Teachers table - Restrict access to financial data
-- 2. Profiles table - Restrict to owner + admins
-- 3. Students table - Restrict to admins only
-- 4. Payment gateways - Hide API keys from non-super-admins
-- 5. Donations - Remove public insert, require server-side processing

-- =====================================================
-- 1. FIX: Teachers Financial Data Exposure
-- =====================================================

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view teachers" ON public.teachers;

-- Create admin-only policy for full access (including financial data)
CREATE POLICY "Admins can view all teacher data" ON public.teachers
    FOR SELECT USING (public.is_admin(auth.uid()));

-- Create a public view for non-sensitive teacher data (for public display)
CREATE OR REPLACE VIEW public.teachers_public 
WITH (security_invoker = on) AS
SELECT 
    id,
    teacher_id,
    full_name,
    full_name_arabic,
    phone,
    qualification,
    specialization,
    photo_url,
    status,
    joining_date,
    title_id
FROM public.teachers
WHERE status = 'active';

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.teachers_public TO authenticated;
GRANT SELECT ON public.teachers_public TO anon;

-- =====================================================
-- 2. FIX: Profiles Table Public Exposure
-- =====================================================

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create policy allowing users to view only their own profile or admins can view all
CREATE POLICY "Users can view own profile or admins view all" ON public.profiles
    FOR SELECT USING (
        auth.uid() = user_id OR 
        public.is_admin(auth.uid())
    );

-- =====================================================
-- 3. FIX: Students Table Public Exposure
-- =====================================================

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view students" ON public.students;

-- Create admin-only SELECT policy for full student data
CREATE POLICY "Admins and authorized staff can view students" ON public.students
    FOR SELECT USING (
        public.is_admin(auth.uid()) OR 
        public.has_role(auth.uid(), 'teacher') OR
        public.has_role(auth.uid(), 'accountant')
    );

-- Create a public view for limited student data (for public listings like results)
CREATE OR REPLACE VIEW public.students_public
WITH (security_invoker = on) AS
SELECT 
    id,
    student_id,
    full_name,
    full_name_arabic,
    class_id,
    photo_url,
    status
FROM public.students
WHERE status IN ('active', 'lillah');

-- Grant SELECT on the view
GRANT SELECT ON public.students_public TO authenticated;
GRANT SELECT ON public.students_public TO anon;

-- =====================================================
-- 4. FIX: Payment Gateway Credentials Exposure
-- =====================================================

-- Drop the existing SELECT policy that exposes API keys
DROP POLICY IF EXISTS "Anyone can view enabled gateways" ON public.payment_gateways;

-- Create a secure view that masks sensitive credentials (using correct column names)
CREATE OR REPLACE VIEW public.payment_gateways_public
WITH (security_invoker = on) AS
SELECT 
    id,
    gateway_type,
    display_name,
    is_enabled,
    sandbox_mode,
    display_order,
    merchant_id,
    logo_url,
    created_at,
    updated_at
    -- Explicitly excludes: api_key_encrypted, api_secret_encrypted
FROM public.payment_gateways
WHERE is_enabled = true;

-- Grant SELECT on the public view to all
GRANT SELECT ON public.payment_gateways_public TO authenticated;
GRANT SELECT ON public.payment_gateways_public TO anon;

-- Create policy: Only super_admins can view API keys (full table access)
CREATE POLICY "Super admins can view all gateway data" ON public.payment_gateways
    FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- =====================================================
-- 5. FIX: Public Donation Insert Without Validation
-- =====================================================

-- Drop existing public insert policies
DROP POLICY IF EXISTS "Anyone can create donation" ON public.donations;
DROP POLICY IF EXISTS "Public can create donation with valid data" ON public.donations;

-- Only allow donation creation via server-side (edge function with service role)
-- No public insert policy - donations must go through process-donation edge function
CREATE POLICY "Admins can create and manage donations" ON public.donations
    FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Add database constraints for additional validation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'valid_donation_amount'
    ) THEN
        ALTER TABLE public.donations ADD CONSTRAINT valid_donation_amount 
            CHECK (amount > 0 AND amount <= 100000000);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'valid_donor_name_length'
    ) THEN
        ALTER TABLE public.donations ADD CONSTRAINT valid_donor_name_length 
            CHECK (LENGTH(donor_name) >= 2);
    END IF;
END $$;

-- =====================================================
-- Additional: Improve SELECT security for public viewing of donations
-- =====================================================

-- Allow public to view donation stats (aggregate only, not individual records)
-- Create a function for safe aggregate data
CREATE OR REPLACE FUNCTION public.get_donation_stats()
RETURNS TABLE(
    total_amount NUMERIC,
    total_count BIGINT,
    completed_amount NUMERIC,
    completed_count BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(*) as total_count,
        COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END), 0) as completed_amount,
        COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_count
    FROM public.donations;
$$;