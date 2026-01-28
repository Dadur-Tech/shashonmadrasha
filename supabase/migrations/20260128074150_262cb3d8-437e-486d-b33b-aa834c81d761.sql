-- =====================================================
-- PART 1: Enhance institution_settings with more fields
-- =====================================================
ALTER TABLE public.institution_settings 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS working_hours text DEFAULT 'সকাল ৯টা - বিকাল ৫টা',
ADD COLUMN IF NOT EXISTS off_day text DEFAULT 'শুক্রবার',
ADD COLUMN IF NOT EXISTS facebook_url text,
ADD COLUMN IF NOT EXISTS youtube_url text,
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS motto text,
ADD COLUMN IF NOT EXISTS favicon_url text;

-- =====================================================
-- PART 2: Create meal_schedule table for admin control
-- =====================================================
CREATE TABLE IF NOT EXISTS public.meal_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_index integer NOT NULL CHECK (day_index >= 0 AND day_index <= 6),
  day_name text NOT NULL,
  breakfast text,
  lunch text,
  dinner text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(day_index)
);

-- Enable RLS
ALTER TABLE public.meal_schedule ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meal_schedule
CREATE POLICY "Admins can manage meal schedule"
  ON public.meal_schedule FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can view meal schedule"
  ON public.meal_schedule FOR SELECT
  USING (true);

-- Insert default meal schedule data
INSERT INTO public.meal_schedule (day_index, day_name, breakfast, lunch, dinner)
VALUES 
  (0, 'রবিবার', 'পরোটা, ডিম, চা', 'ভাত, গরুর মাংস, ডাল', 'খিচুড়ি, সালাদ'),
  (1, 'সোমবার', 'রুটি, সবজি, চা', 'ভাত, মাছ, আলু ভর্তা', 'ভাত, ডাল, সবজি'),
  (2, 'মঙ্গলবার', 'পরোটা, হালুয়া', 'ভাত, খাসির মাংস', 'ভাত, ডিম, সালাদ'),
  (3, 'বুধবার', 'রুটি, সবজি, চা', 'ভাত, মুরগি, ডাল', 'খিচুড়ি, পায়েস'),
  (4, 'বৃহস্পতিবার', 'পরোটা, ডাল, চা', 'বিরিয়ানি', 'ভাত, মাছ ভাজি'),
  (5, 'শুক্রবার', 'রুটি, সবজি, চা', 'পোলাও, মুরগি, সালাদ', 'ভাত, ডাল, সবজি'),
  (6, 'শনিবার', 'রুটি, ডাল, সবজি', 'ভাত, মাছ, ডাল, সবজি', 'ভাত, মুরগি, সালাদ')
ON CONFLICT (day_index) DO NOTHING;

-- =====================================================
-- PART 3: Security Fixes - Tighten RLS Policies
-- =====================================================

-- Fix sponsors table - should not be publicly readable
DROP POLICY IF EXISTS "Anyone can view sponsors" ON public.sponsors;
CREATE POLICY "Only admins can view sponsors"
  ON public.sponsors FOR SELECT
  USING (is_admin(auth.uid()));

-- Fix teachers table - restrict base table to admins only
DROP POLICY IF EXISTS "Authenticated users can view teachers" ON public.teachers;
CREATE POLICY "Only admins can view teacher details"
  ON public.teachers FOR SELECT
  USING (is_admin(auth.uid()));

-- Fix donations table - only admins and accountants
DROP POLICY IF EXISTS "Authenticated users can view donations" ON public.donations;
CREATE POLICY "Admins and accountants can view donations"
  ON public.donations FOR SELECT
  USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'accountant'::app_role));

-- Fix payment_transactions - only admins and accountants 
DROP POLICY IF EXISTS "Authenticated users can view transactions" ON public.payment_transactions;
CREATE POLICY "Admins and accountants view transactions"
  ON public.payment_transactions FOR SELECT
  USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'accountant'::app_role));

-- Fix student_fees - only admins and accountants
DROP POLICY IF EXISTS "Authenticated users can view student fees" ON public.student_fees;
CREATE POLICY "Admins and accountants view student fees"
  ON public.student_fees FOR SELECT
  USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'accountant'::app_role));

-- Fix teacher_salaries - only super_admin and specific accountant
DROP POLICY IF EXISTS "Admins and accountants can manage salaries" ON public.teacher_salaries;
CREATE POLICY "Super admins manage salaries"
  ON public.teacher_salaries FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Accountants can view salaries"
  ON public.teacher_salaries FOR SELECT
  USING (has_role(auth.uid(), 'accountant'::app_role));

-- =====================================================
-- PART 4: Add trigger for meal_schedule updated_at
-- =====================================================
CREATE TRIGGER update_meal_schedule_updated_at
  BEFORE UPDATE ON public.meal_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();