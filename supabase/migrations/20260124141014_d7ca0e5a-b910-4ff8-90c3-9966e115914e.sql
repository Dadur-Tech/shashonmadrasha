-- =====================================================
-- Fix Public Access for Landing Pages
-- =====================================================

-- 1. Add public SELECT policy for students_public view data
-- Allow anon users to read from students for the public view
CREATE POLICY "Public can view basic student info via public view" ON public.students
    FOR SELECT TO anon
    USING (status IN ('active', 'lillah'));

-- 2. Add public SELECT policy for exam_results for result viewing
CREATE POLICY "Public can view published exam results" ON public.exam_results
    FOR SELECT TO anon
    USING (
        EXISTS (
            SELECT 1 FROM public.exams 
            WHERE exams.id = exam_results.exam_id 
            AND exams.is_published = true
        )
    );

-- 3. Add public SELECT policy for exams (for dropdown)
CREATE POLICY "Public can view published exams" ON public.exams
    FOR SELECT TO anon
    USING (is_published = true);

-- 4. Add public SELECT policy for classes (needed for filters)
CREATE POLICY "Public can view active classes" ON public.classes
    FOR SELECT TO anon
    USING (is_active = true);