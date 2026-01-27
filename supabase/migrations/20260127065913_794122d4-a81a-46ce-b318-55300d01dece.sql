-- Drop and recreate the payment_gateways_public view with proper access
-- This view exposes only non-sensitive gateway info for public donation forms

DROP VIEW IF EXISTS public.payment_gateways_public;

CREATE VIEW public.payment_gateways_public 
WITH (security_invoker = false)
AS
SELECT 
  id,
  gateway_type,
  display_name,
  is_enabled,
  merchant_id,  -- Only the merchant number (not API keys)
  logo_url,
  sandbox_mode,
  display_order,
  created_at,
  updated_at
FROM public.payment_gateways
WHERE is_enabled = true;

-- Grant SELECT access to anon and authenticated users
GRANT SELECT ON public.payment_gateways_public TO anon;
GRANT SELECT ON public.payment_gateways_public TO authenticated;