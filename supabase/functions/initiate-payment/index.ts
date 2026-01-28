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
    
    // Check payment mode from config
    const paymentMode = gatewayConfig.additional_config?.payment_mode || 'manual';

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
    } else if (gateway === 'bkash') {
      // Check if API mode is enabled
      if (paymentMode === 'api' && gatewayConfig.api_key_encrypted && gatewayConfig.api_secret_encrypted) {
        try {
          paymentData = await initiateBkash({
            appKey: gatewayConfig.api_key_encrypted,
            appSecret: gatewayConfig.api_secret_encrypted,
            username: gatewayConfig.merchant_id || '',
            password: gatewayConfig.additional_config?.bkash_password || '',
            amount,
            transactionId,
            payerPhone: payer_phone,
            callbackUrl: `${callbackUrl}?gateway=bkash&return_url=${encodeURIComponent(return_url)}`,
            isSandbox: gatewayConfig.sandbox_mode,
          });
          
          if (paymentData.bkashURL) {
            paymentUrl = paymentData.bkashURL;
          } else {
            // If bKash API fails, fallback to manual
            console.error('bKash API returned no URL:', paymentData);
            paymentData = {
              type: 'mobile_wallet',
              gateway,
              transactionId,
              amount,
              instructions: getMobileWalletInstructions(gateway, gatewayConfig.merchant_id, amount, gatewayConfig.additional_config?.custom_instructions),
              merchantNumber: gatewayConfig.merchant_id,
              apiError: paymentData.statusMessage || 'API সমস্যা - ম্যানুয়াল পেমেন্ট করুন',
            };
          }
        } catch (error) {
          console.error('bKash API error:', error);
          // Fallback to manual on error
          paymentData = {
            type: 'mobile_wallet',
            gateway,
            transactionId,
            amount,
            instructions: getMobileWalletInstructions(gateway, gatewayConfig.merchant_id, amount, gatewayConfig.additional_config?.custom_instructions),
            merchantNumber: gatewayConfig.merchant_id,
            apiError: error instanceof Error ? error.message : 'API সংযোগ সমস্যা',
          };
        }
      } else {
        // Manual mode - show payment instructions
        paymentData = {
          type: 'mobile_wallet',
          gateway,
          transactionId,
          amount,
          instructions: getMobileWalletInstructions(gateway, gatewayConfig.merchant_id, amount, gatewayConfig.additional_config?.custom_instructions),
          merchantNumber: gatewayConfig.merchant_id,
        };
      }
    } else if (['nagad', 'rocket', 'upay'].includes(gateway)) {
      // For other mobile wallets - show payment instructions (manual mode)
      paymentData = {
        type: 'mobile_wallet',
        gateway,
        transactionId,
        amount,
        instructions: getMobileWalletInstructions(gateway, gatewayConfig.merchant_id, amount, gatewayConfig.additional_config?.custom_instructions),
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

// bKash Tokenized Checkout API
async function initiateBkash(params: {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  amount: number;
  transactionId: string;
  payerPhone: string;
  callbackUrl: string;
  isSandbox: boolean;
}): Promise<any> {
  const baseUrl = params.isSandbox 
    ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
    : 'https://tokenized.pay.bka.sh/v1.2.0-beta';

  console.log('bKash Init - Using baseUrl:', baseUrl);
  console.log('bKash Init - App Key length:', params.appKey?.length);
  console.log('bKash Init - Username:', params.username);

  // Step 1: Grant Token
  const grantTokenResponse = await fetch(`${baseUrl}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'username': params.username,
      'password': params.password,
    },
    body: JSON.stringify({
      app_key: params.appKey,
      app_secret: params.appSecret,
    }),
  });

  const tokenData = await grantTokenResponse.json();
  console.log('bKash Token Response:', JSON.stringify(tokenData));

  if (tokenData.statusCode !== '0000' || !tokenData.id_token) {
    console.error('bKash token grant failed:', tokenData);
    return {
      statusCode: tokenData.statusCode || 'ERROR',
      statusMessage: tokenData.statusMessage || 'টোকেন পেতে সমস্যা হয়েছে। App Key/Secret চেক করুন।',
    };
  }

  const idToken = tokenData.id_token;

  // Step 2: Create Payment
  const createPaymentResponse = await fetch(`${baseUrl}/tokenized/checkout/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': idToken,
      'X-APP-Key': params.appKey,
    },
    body: JSON.stringify({
      mode: '0011', // Checkout URL mode
      payerReference: params.payerPhone,
      callbackURL: params.callbackUrl,
      amount: params.amount.toString(),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: params.transactionId,
    }),
  });

  const paymentData = await createPaymentResponse.json();
  console.log('bKash Create Payment Response:', JSON.stringify(paymentData));

  if (paymentData.statusCode !== '0000') {
    console.error('bKash create payment failed:', paymentData);
    return {
      statusCode: paymentData.statusCode || 'ERROR',
      statusMessage: paymentData.statusMessage || 'পেমেন্ট তৈরি করতে সমস্যা হয়েছে',
    };
  }

  return {
    bkashURL: paymentData.bkashURL,
    paymentID: paymentData.paymentID,
    statusCode: paymentData.statusCode,
    statusMessage: paymentData.statusMessage,
    idToken, // Store for later use in callback
  };
}

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

function getMobileWalletInstructions(gateway: string, merchantNumber: string | null, amount: number, customInstructions?: string): string {
  // If custom instructions are provided, use them
  if (customInstructions && customInstructions.trim()) {
    return customInstructions
      .replace(/\{number\}/g, merchantNumber || 'মার্চেন্ট নম্বর কনফিগার করুন')
      .replace(/\{amount\}/g, amount.toLocaleString('bn-BD'));
  }
  
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
