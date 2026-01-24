-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Update handle_new_user trigger to also store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_full_name TEXT;
BEGIN
  -- Extract and sanitize full_name from user metadata
  v_full_name := COALESCE(
    TRIM(SUBSTRING(NEW.raw_user_meta_data->>'full_name', 1, 100)),
    'User'
  );
  
  -- Ensure not empty after trimming
  IF LENGTH(v_full_name) = 0 THEN
    v_full_name := 'User';
  END IF;
  
  -- Remove any potentially dangerous characters
  IF v_full_name !~ '^[\p{L}\p{N}\s''.\-]+$' THEN
    IF NOT (v_full_name ~ '[\p{L}\p{N}]') THEN
      v_full_name := 'User';
    END IF;
  END IF;
  
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, v_full_name, NEW.email);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    BEGIN
      INSERT INTO public.profiles (user_id, full_name, email)
      VALUES (NEW.id, 'User', NEW.email);
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Fallback profile creation also failed for user %: %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
END;
$function$;

-- Update existing profiles with emails from auth.users (needs service role)
-- This will be done via a separate update query