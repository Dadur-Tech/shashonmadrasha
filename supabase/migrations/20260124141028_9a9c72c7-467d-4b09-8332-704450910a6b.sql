-- =====================================================
-- Create public view for Lillah students
-- =====================================================

-- Create a public view for lillah students (hides sensitive data)
CREATE OR REPLACE VIEW public.lillah_students_public
WITH (security_invoker = off) AS
SELECT 
    s.id,
    s.student_id,
    s.full_name,
    s.father_name,
    s.photo_url,
    s.is_orphan,
    s.lillah_reason,
    s.sponsor_id,
    s.class_id,
    c.name as class_name,
    c.department as class_department,
    sp.full_name as sponsor_name
FROM public.students s
LEFT JOIN public.classes c ON c.id = s.class_id
LEFT JOIN public.sponsors sp ON sp.id = s.sponsor_id
WHERE s.is_lillah = true AND s.status = 'active';

-- Grant SELECT on the view to anon
GRANT SELECT ON public.lillah_students_public TO anon;
GRANT SELECT ON public.lillah_students_public TO authenticated;