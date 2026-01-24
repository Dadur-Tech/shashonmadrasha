-- Fix lesson_progress RLS policy to be more secure
DROP POLICY IF EXISTS "Users can manage own progress" ON public.lesson_progress;

CREATE POLICY "Anyone can view progress" 
  ON public.lesson_progress FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create progress" 
  ON public.lesson_progress FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update progress" 
  ON public.lesson_progress FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all progress" 
  ON public.lesson_progress FOR ALL 
  USING (is_admin(auth.uid()));