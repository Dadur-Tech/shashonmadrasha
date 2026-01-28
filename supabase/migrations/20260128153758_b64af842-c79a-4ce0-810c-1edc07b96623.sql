-- =====================================================
-- SECURITY FIX: Remove phone from teachers_public view
-- =====================================================

-- Drop and recreate teachers_public view without phone
DROP VIEW IF EXISTS public.teachers_public;

CREATE VIEW public.teachers_public
WITH (security_invoker = on)
AS SELECT 
  id,
  teacher_id,
  full_name,
  full_name_arabic,
  title_id,
  specialization,
  qualification,
  photo_url,
  status
FROM public.teachers
WHERE status = 'active';

-- Grant SELECT on the view
GRANT SELECT ON public.teachers_public TO anon, authenticated;

-- =====================================================
-- SECURITY FIX: Restrict exam_results to authenticated users
-- =====================================================

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view published exam results" ON public.exam_results;
DROP POLICY IF EXISTS "Authenticated can view published exam results" ON public.exam_results;

-- Create authenticated-only policy for published results
CREATE POLICY "Authenticated can view published exam results"
ON public.exam_results
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.exams
    WHERE exams.id = exam_results.exam_id
    AND exams.is_published = true
  )
);