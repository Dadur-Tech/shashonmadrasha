-- Fix security warnings

-- 1. Fix function search_path for handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'));
    RETURN NEW;
END;
$$;

-- 2. Fix function search_path for update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 3. Fix overly permissive INSERT policies
-- Drop the permissive policies
DROP POLICY IF EXISTS "Anyone can create sponsor" ON public.sponsors;
DROP POLICY IF EXISTS "Anyone can create donation" ON public.donations;
DROP POLICY IF EXISTS "Anyone can create payment transaction" ON public.payment_transactions;

-- Create better policies that still allow public donations but with validation
-- Sponsors - anyone can create but must provide required fields
CREATE POLICY "Public can create sponsor with valid data" ON public.sponsors
    FOR INSERT WITH CHECK (
        full_name IS NOT NULL AND 
        full_name != '' AND 
        phone IS NOT NULL AND 
        phone != ''
    );

-- Donations - anyone can create but must have valid amount and donor info
CREATE POLICY "Public can create donation with valid data" ON public.donations
    FOR INSERT WITH CHECK (
        donor_name IS NOT NULL AND 
        donor_name != '' AND 
        amount > 0 AND
        donation_id IS NOT NULL
    );

-- Payment transactions - must have valid amount and transaction_id
CREATE POLICY "Public can create payment with valid data" ON public.payment_transactions
    FOR INSERT WITH CHECK (
        amount > 0 AND
        transaction_id IS NOT NULL AND
        payment_type IS NOT NULL
    );