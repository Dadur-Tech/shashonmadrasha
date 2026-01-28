-- Add language column to institution_settings table
ALTER TABLE public.institution_settings 
ADD COLUMN IF NOT EXISTS system_language TEXT DEFAULT 'bn' CHECK (system_language IN ('bn', 'en'));