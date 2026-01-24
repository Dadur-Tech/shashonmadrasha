import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  gateway: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'sslcommerz' | 'amarpay';
  amount: number;
  reference_id: string;
  reference_type: 'donation' | 'fee';
  payer_name: string;
  payer_phone: string;
  payer_email?: string;
  return_url: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: PaymentRequest = await req.json();
    const { gateway, amount, reference_id, reference_type, payer_name, payer_phone, payer_email, return_url } = body;

    if (!gateway || !amount || !reference_id || !payer_name || !payer_phone) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get gateway credentials from database
    const { data: gatewayConfig, error: gatewayError } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('gateway_type', gateway)
      .eq('is_enabled', true)
      .single();

    if (gatewayError || !gatewayConfig) {
      return new Response(
        JSON.stringify({ error: 'Gateway not found or not enabled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment transaction record
    const { error: txnError } = await supabase
      .from('payment_transactions')
      .insert({
        transaction_id: transactionId,
        amount,
        payment_gateway: gateway,
        payment_type: reference_type,
        reference_id,
        payer_name,
        payer_phone,
        status: 'pending',
      });

    if (txnError) {
      console.error('Transaction insert error:', txnError);
      return new Response(
        JSON.stringify({ error: 'Failed to create transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const baseUrl = supabaseUrl.replace('.supabase.co', '.supabase.co/functions/v1');
    const callbackUrl = `${baseUrl}/payment-callback`;

    let paymentUrl: string = '';
    let paymentData: any = {};

    // Handle different gateways
    if (gateway === 'sslcommerz') {
      paymentData = await initiateSSLCommerz({
        storeId: gatewayConfig.merchant_id,
        storePassword: gatewayConfig.api_secret_encrypted,
        amount,
        transactionId,
        payerName: payer_name,
        payerPhone: payer_phone,
        payerEmail: payer_email || 'donor@example.com',
        successUrl: `${callbackUrl}?gateway=sslcommerz&status=success`,
        failUrl: `${callbackUrl}?gateway=sslcommerz&status=fail`,
        cancelUrl: `${callbackUrl}?gateway=sslcommerz&status=cancel`,
        isSandbox: gatewayConfig.sandbox_mode,
        returnUrl: return_url,
      });
      paymentUrl = paymentData.redirectUrl;
    } else if (gateway === 'amarpay') {
      paymentData = await initiateAmarPay({
        storeId: gatewayConfig.merchant_id,
        signatureKey: gatewayConfig.api_secret_encrypted,
        amount,
        transactionId,
        payerName: payer_name,
        payerPhone: payer_phone,
        payerEmail: payer_email || 'donor@example.com',
        successUrl: `${callbackUrl}?gateway=amarpay&status=success&return_url=${encodeURIComponent(return_url)}`,
        failUrl: `${callbackUrl}?gateway=amarpay&status=fail&return_url=${encodeURIComponent(return_url)}`,
        cancelUrl: `${callbackUrl}?gateway=amarpay&status=cancel&return_url=${encodeURIComponent(return_url)}`,
        isSandbox: gatewayConfig.sandbox_mode,
      });
      paymentUrl = paymentData.paymentUrl;
    } else if (['bkash', 'nagad', 'rocket', 'upay'].includes(gateway)) {
      // For mobile wallets - show QR code or payment number
      paymentData = {
        type: 'mobile_wallet',
        gateway,
        transactionId,
        amount,
        instructions: getMobileWalletInstructions(gateway, gatewayConfig.merchant_id, amount),
        merchantNumber: gatewayConfig.merchant_id,
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        transactionId,
        paymentUrl,
        paymentData,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment initiation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function initiateSSLCommerz(params: {
  storeId: string | null;
  storePassword: string | null;
  amount: number;
  transactionId: string;
  payerName: string;
  payerPhone: string;
  payerEmail: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  isSandbox: boolean;
  returnUrl: string;
}) {
  const baseUrl = params.isSandbox 
    ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
    : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';

  const formData = new URLSearchParams({
    store_id: params.storeId || 'testbox',
    store_passwd: params.storePassword || 'qwerty',
    total_amount: params.amount.toString(),
    currency: 'BDT',
    tran_id: params.transactionId,
    success_url: params.successUrl,
    fail_url: params.failUrl,
    cancel_url: params.cancelUrl,
    cus_name: params.payerName,
    cus_email: params.payerEmail,
    cus_phone: params.payerPhone,
    cus_add1: 'Bangladesh',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    shipping_method: 'NO',
    product_name: 'Donation',
    product_category: 'Donation',
    product_profile: 'general',
    value_a: params.returnUrl,
  });

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    
    const data = await response.json();
    
    if (data.status === 'SUCCESS') {
      return { redirectUrl: data.GatewayPageURL };
    } else {
      console.error('SSLCommerz error:', data);
      throw new Error(data.failedreason || 'SSLCommerz initialization failed');
    }
  } catch (error) {
    console.error('SSLCommerz API error:', error);
    throw error;
  }
}

async function initiateAmarPay(params: {
  storeId: string | null;
  signatureKey: string | null;
  amount: number;
  transactionId: string;
  payerName: string;
  payerPhone: string;
  payerEmail: string;
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  isSandbox: boolean;
}) {
  const baseUrl = params.isSandbox 
    ? 'https://sandbox.aamarpay.com/jsonpost.php'
    : 'https://secure.aamarpay.com/jsonpost.php';

  const payload = {
    store_id: params.storeId || 'aamarpaytest',
    signature_key: params.signatureKey || 'dbb74894e82415a2f7ff0ec3a97e4183',
    tran_id: params.transactionId,
    amount: params.amount,
    currency: 'BDT',
    desc: 'মাদরাসায় দান/ফি',
    cus_name: params.payerName,
    cus_email: params.payerEmail,
    cus_phone: params.payerPhone,
    cus_add1: 'Bangladesh',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    success_url: params.successUrl,
    fail_url: params.failUrl,
    cancel_url: params.cancelUrl,
    type: 'json',
  };

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    if (data.result === 'true' || data.payment_url) {
      return { paymentUrl: data.payment_url };
    } else {
      console.error('AmarPay error:', data);
      throw new Error('AmarPay initialization failed');
    }
  } catch (error) {
    console.error('AmarPay API error:', error);
    throw error;
  }
}

function getMobileWalletInstructions(gateway: string, merchantNumber: string | null, amount: number): string {
  const number = merchantNumber || 'মার্চেন্ট নম্বর কনফিগার করুন';
  const amountBn = amount.toLocaleString('bn-BD');
  
  const instructions: Record<string, string> = {
    bkash: `১. বিকাশ অ্যাপ খুলুন
২. "Send Money" বা "Payment" সিলেক্ট করুন
৩. নম্বর দিন: ${number}
৪. পরিমাণ: ৳${amountBn}
৫. রেফারেন্সে Transaction ID দিন
৬. পিন দিয়ে কনফার্ম করুন`,
    nagad: `১. নগদ অ্যাপ খুলুন বা *167# ডায়াল করুন
২. "Send Money" সিলেক্ট করুন
৩. নম্বর দিন: ${number}
৪. পরিমাণ: ৳${amountBn}
৫. রেফারেন্সে Transaction ID দিন
৬. পিন দিয়ে কনফার্ম করুন`,
    rocket: `১. *322# ডায়াল করুন
২. "Payment" সিলেক্ট করুন
৩. নম্বর দিন: ${number}
৪. পরিমাণ: ৳${amountBn}
৫. পিন দিয়ে কনফার্ম করুন`,
    upay: `১. উপায় অ্যাপ খুলুন
২. "Send Money" সিলেক্ট করুন
৩. নম্বর দিন: ${number}
৪. পরিমাণ: ৳${amountBn}
৫. পিন দিয়ে কনফার্ম করুন`,
  };
  
  return instructions[gateway] || 'নির্দেশনা পাওয়া যায়নি';
}
