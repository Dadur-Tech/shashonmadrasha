-- Improve handle_new_user trigger with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
  
  -- Remove any potentially dangerous characters (keep letters, numbers, spaces, Bengali, common punctuation)
  -- If the name contains only invalid characters, fall back to 'User'
  IF v_full_name !~ '^[\p{L}\p{N}\s''.\-]+$' THEN
    -- Check if there are any valid characters, if not use default
    IF NOT (v_full_name ~ '[\p{L}\p{N}]') THEN
      v_full_name := 'User';
    END IF;
  END IF;
  
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, v_full_name);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but allow user creation to proceed
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    -- Try to create with default name as fallback
    BEGIN
      INSERT INTO public.profiles (user_id, full_name)
      VALUES (NEW.id, 'User');
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Fallback profile creation also failed for user %: %', NEW.id, SQLERRM;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;