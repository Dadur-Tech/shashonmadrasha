-- Ensure authenticated role can read user_roles
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON TABLE public.user_roles TO authenticated;

-- Also grant to anon for edge cases
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON TABLE public.user_roles TO anon;