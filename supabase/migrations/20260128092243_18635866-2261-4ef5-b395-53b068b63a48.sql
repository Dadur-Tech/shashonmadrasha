-- Fix RLS policy for payment_gateways_public view
-- The view needs proper SELECT policy for anonymous users

-- Drop and recreate the view with security_invoker = false to bypass RLS
DROP VIEW IF EXISTS payment_gateways_public;

CREATE VIEW payment_gateways_public 
WITH (security_invoker = false)
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
FROM payment_gateways
WHERE is_enabled = true;

-- Grant SELECT to anon and authenticated roles
GRANT SELECT ON payment_gateways_public TO anon;
GRANT SELECT ON payment_gateways_public TO authenticated;