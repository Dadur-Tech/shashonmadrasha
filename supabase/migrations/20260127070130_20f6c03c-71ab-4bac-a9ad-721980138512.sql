-- Change reference_id column from UUID to TEXT to support donation_id strings like "DON-2026-7629"
ALTER TABLE public.payment_transactions 
ALTER COLUMN reference_id TYPE TEXT;