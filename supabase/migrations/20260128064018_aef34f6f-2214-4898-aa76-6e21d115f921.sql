-- Fix linter: remove SECURITY DEFINER behavior and expose only non-sensitive gateway config to public
DROP VIEW IF EXISTS public.payment_gateways_public;

CREATE VIEW public.payment_gateways_public
WITH (security_invoker = true)
AS
SELECT 
  id,
  gateway_type,
  display_name,
  is_enabled,
  merchant_id,
  logo_url,
  sandbox_mode,
  display_order,
  additional_config,
  created_at,
  updated_at
FROM public.payment_gateways
WHERE is_enabled = true;

GRANT SELECT ON public.payment_gateways_public TO anon;
GRANT SELECT ON public.payment_gateways_public TO authenticated;