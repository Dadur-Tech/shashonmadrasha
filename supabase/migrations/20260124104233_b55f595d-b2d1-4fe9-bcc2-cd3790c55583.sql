-- Create courses table for organizing classes into series
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  title_arabic text,
  description text,
  thumbnail_url text,
  instructor_id uuid REFERENCES public.teachers(id),
  department text DEFAULT 'kitab',
  difficulty_level text DEFAULT 'beginner', -- beginner, intermediate, advanced
  price numeric DEFAULT 0,
  is_free boolean DEFAULT true,
  is_published boolean DEFAULT false,
  total_duration_minutes integer DEFAULT 0,
  total_lessons integer DEFAULT 0,
  enrollment_count integer DEFAULT 0,
  rating numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- RLS policies for courses
CREATE POLICY "Anyone can view published courses" 
  ON public.courses FOR SELECT 
  USING (is_published = true OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage courses" 
  ON public.courses FOR ALL 
  USING (is_admin(auth.uid()));

-- Add course_id and pricing fields to online_classes
ALTER TABLE public.online_classes 
  ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES public.courses(id),
  ADD COLUMN IF NOT EXISTS price numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_free boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS video_type text DEFAULT 'youtube', -- youtube, upload, live
  ADD COLUMN IF NOT EXISTS lesson_order integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;

-- Create course enrollments table
CREATE TABLE public.course_enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  user_phone text,
  user_name text,
  payment_status text DEFAULT 'pending', -- pending, paid, free
  payment_transaction_id uuid REFERENCES public.payment_transactions(id),
  enrolled_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  progress_percentage integer DEFAULT 0,
  last_watched_lesson_id uuid REFERENCES public.online_classes(id)
);

-- Enable RLS on enrollments
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS policies for enrollments
CREATE POLICY "Users can view own enrollments" 
  ON public.course_enrollments FOR SELECT 
  USING (user_email = current_setting('request.jwt.claims', true)::json->>'email' OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage enrollments" 
  ON public.course_enrollments FOR ALL 
  USING (is_admin(auth.uid()));

CREATE POLICY "Public can create enrollment" 
  ON public.course_enrollments FOR INSERT 
  WITH CHECK (user_email IS NOT NULL AND course_id IS NOT NULL);

-- Create lesson progress tracking
CREATE TABLE public.lesson_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id uuid REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.online_classes(id) ON DELETE CASCADE,
  watched_percentage integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  last_watched_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(enrollment_id, lesson_id)
);

-- Enable RLS on lesson progress
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own progress" 
  ON public.lesson_progress FOR ALL 
  USING (true);

-- Add logo_url field to payment_gateways for custom logos
ALTER TABLE public.payment_gateways 
  ADD COLUMN IF NOT EXISTS logo_url text;

-- Create trigger to update courses stats
CREATE OR REPLACE FUNCTION update_course_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.courses 
    SET 
      total_lessons = (SELECT COUNT(*) FROM public.online_classes WHERE course_id = NEW.course_id),
      total_duration_minutes = (SELECT COALESCE(SUM(duration_minutes), 0) FROM public.online_classes WHERE course_id = NEW.course_id),
      updated_at = now()
    WHERE id = NEW.course_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE public.courses 
    SET 
      total_lessons = (SELECT COUNT(*) FROM public.online_classes WHERE course_id = OLD.course_id),
      total_duration_minutes = (SELECT COALESCE(SUM(duration_minutes), 0) FROM public.online_classes WHERE course_id = OLD.course_id),
      updated_at = now()
    WHERE id = OLD.course_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_course_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.online_classes
FOR EACH ROW
EXECUTE FUNCTION update_course_stats();