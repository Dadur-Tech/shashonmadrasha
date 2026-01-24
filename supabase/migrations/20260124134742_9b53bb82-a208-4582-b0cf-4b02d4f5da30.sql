-- Fix permissions + policies so the frontend can read roles and admin can manage roles

-- Ensure RLS is enabled (should already be)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Grants required for PostgREST queries from the frontend
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_roles TO authenticated;

-- Tighten policies to authenticated role (instead of PUBLIC)
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
