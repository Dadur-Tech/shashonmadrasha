import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const gateway = url.searchParams.get('gateway');
    const status = url.searchParams.get('status');
    let returnUrl = url.searchParams.get('return_url') || '/';

    // Ensure returnUrl is a valid URL, not just a path
    if (returnUrl && !returnUrl.startsWith('http')) {
      // Default to the main site if return_url is relative
      returnUrl = `https://shashonmadrasha.lovable.app${returnUrl.startsWith('/') ? returnUrl : '/' + returnUrl}`;
    }

    let transactionId: string | null = null;
    let gatewayTransactionId: string | null = null;
    let paymentStatus: 'completed' | 'failed' | 'cancelled' = 'failed';

    // Parse request body for POST callbacks
    let body: any = {};
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        body = await req.json();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await req.formData();
        for (const [key, value] of formData.entries()) {
          body[key] = value;
        }
      }
    }

    console.log('Payment callback received:', { gateway, status, body: JSON.stringify(body).substring(0, 500) });

    // Handle bKash embedded checkout execute
    if (body.gateway === 'bkash' && body.paymentID && body.idToken) {
      console.log('bKash Execute - paymentID:', body.paymentID);
      
      // Get gateway config from database
      const { data: gatewayConfig, error: gatewayError } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('gateway_type', 'bkash')
        .eq('is_enabled', true)
        .single();

      if (gatewayError || !gatewayConfig) {
        return new Response(
          JSON.stringify({ success: false, message: 'Gateway not found or not enabled' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const baseUrl = gatewayConfig.sandbox_mode 
        ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
        : 'https://tokenized.pay.bka.sh/v1.2.0-beta';

      // Execute the payment
      const executeResponse = await fetch(`${baseUrl}/tokenized/checkout/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': body.idToken,
          'X-APP-Key': gatewayConfig.api_key_encrypted,
        },
        body: JSON.stringify({
          paymentID: body.paymentID,
        }),
      });

      const executeData = await executeResponse.json();
      console.log('bKash Execute Response:', JSON.stringify(executeData));

      if (executeData.statusCode === '0000' && executeData.transactionStatus === 'Completed') {
        // Payment successful - find transaction by merchantInvoiceNumber
        const { data: transaction } = await supabase
          .from('payment_transactions')
          .select('*')
          .eq('transaction_id', executeData.merchantInvoiceNumber)
          .single();

        if (transaction) {
          await supabase
            .from('payment_transactions')
            .update({
              status: 'completed',
              gateway_transaction_id: executeData.trxID,
              payment_date: new Date().toISOString(),
            })
            .eq('id', transaction.id);

          // Update donation status if applicable
          if (transaction.payment_type === 'donation' && transaction.reference_id) {
            await supabase
              .from('donations')
              .update({
                payment_status: 'completed',
                transaction_id: executeData.trxID,
              })
              .eq('donation_id', transaction.reference_id);
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            trxID: executeData.trxID,
            message: 'পেমেন্ট সফল হয়েছে'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: executeData.statusMessage || 'পেমেন্ট সম্পন্ন করতে সমস্যা হয়েছে'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Handle SSLCommerz callback
    if (gateway === 'sslcommerz') {
      transactionId = body.tran_id;
      gatewayTransactionId = body.val_id || body.bank_tran_id;
      returnUrl = body.value_a || returnUrl;
      
      console.log('SSLCommerz callback:', { tran_id: transactionId, status: body.status, val_id: body.val_id });
      
      if (status === 'success' && body.status === 'VALID') {
        paymentStatus = 'completed';
      } else if (status === 'cancel') {
        paymentStatus = 'cancelled';
      } else {
        paymentStatus = 'failed';
      }
    }
    // Handle AmarPay callback
    else if (gateway === 'amarpay') {
      transactionId = body.mer_txnid || body.opt_a;
      gatewayTransactionId = body.pg_txnid;
      
      console.log('AmarPay callback:', { mer_txnid: body.mer_txnid, pay_status: body.pay_status });
      
      if (body.pay_status === 'Successful') {
        paymentStatus = 'completed';
      } else if (status === 'cancel') {
        paymentStatus = 'cancelled';
      } else {
        paymentStatus = 'failed';
      }
    }
    // Handle bKash redirect callback
    else if (gateway === 'bkash') {
      const paymentID = url.searchParams.get('paymentID');
      const callbackStatus = url.searchParams.get('status');
      
      console.log('bKash redirect callback:', { paymentID, callbackStatus });
      
      if (callbackStatus === 'success' && paymentID) {
        // Get the gateway config to execute the payment
        const { data: gatewayConfig } = await supabase
          .from('payment_gateways')
          .select('*')
          .eq('gateway_type', 'bkash')
          .eq('is_enabled', true)
          .single();

        if (gatewayConfig) {
          // For redirect mode, we need to execute the payment here
          const baseUrl = gatewayConfig.sandbox_mode 
            ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
            : 'https://tokenized.pay.bka.sh/v1.2.0-beta';

          // First, get a new token
          const tokenResponse = await fetch(`${baseUrl}/tokenized/checkout/token/grant`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'username': gatewayConfig.merchant_id || '',
              'password': gatewayConfig.additional_config?.bkash_password || '',
            },
            body: JSON.stringify({
              app_key: gatewayConfig.api_key_encrypted,
              app_secret: gatewayConfig.api_secret_encrypted,
            }),
          });

          const tokenData = await tokenResponse.json();
          
          if (tokenData.statusCode === '0000' && tokenData.id_token) {
            // Now execute the payment
            const executeResponse = await fetch(`${baseUrl}/tokenized/checkout/execute`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': tokenData.id_token,
                'X-APP-Key': gatewayConfig.api_key_encrypted,
              },
              body: JSON.stringify({
                paymentID: paymentID,
              }),
            });

            const executeData = await executeResponse.json();
            console.log('bKash Execute (redirect) Response:', JSON.stringify(executeData));

            if (executeData.statusCode === '0000' && executeData.transactionStatus === 'Completed') {
              paymentStatus = 'completed';
              gatewayTransactionId = executeData.trxID;
              transactionId = executeData.merchantInvoiceNumber;
            } else {
              console.error('bKash execute failed:', executeData);
              paymentStatus = 'failed';
            }
          } else {
            console.error('bKash token grant failed for callback:', tokenData);
            paymentStatus = 'failed';
          }
        }
      } else if (callbackStatus === 'cancel') {
        paymentStatus = 'cancelled';
      } else {
        paymentStatus = 'failed';
      }
      
      // If we still don't have transactionId, try to find it from pending transactions
      if (!transactionId && paymentID) {
        const { data: txn } = await supabase
          .from('payment_transactions')
          .select('transaction_id')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        transactionId = txn?.transaction_id || null;
      }
    }
    // Handle Nagad callback
    else if (gateway === 'nagad') {
      const paymentRefId = url.searchParams.get('payment_ref_id') || body.paymentRefId;
      const callbackStatus = url.searchParams.get('status') || body.status;
      transactionId = body.orderId || body.merchant_order_id;
      gatewayTransactionId = paymentRefId;
      
      console.log('Nagad callback:', { paymentRefId, callbackStatus, body: JSON.stringify(body).substring(0, 300) });
      
      if (callbackStatus === 'Success' || body.status === 'Success') {
        paymentStatus = 'completed';
      } else if (callbackStatus === 'Cancelled') {
        paymentStatus = 'cancelled';
      } else {
        paymentStatus = 'failed';
      }
    }
    // Handle Rocket callback
    else if (gateway === 'rocket') {
      transactionId = body.tran_id || url.searchParams.get('tran_id');
      gatewayTransactionId = body.bank_tran_id || body.val_id;
      const rocketStatus = url.searchParams.get('status') || body.status;
      
      console.log('Rocket callback:', { tran_id: transactionId, status: rocketStatus });
      
      if (rocketStatus === 'success' && (body.status === 'VALID' || body.status === 'VALIDATED')) {
        paymentStatus = 'completed';
      } else if (rocketStatus === 'cancel') {
        paymentStatus = 'cancelled';
      } else {
        paymentStatus = 'failed';
      }
    }
    // Handle Upay callback
    else if (gateway === 'upay') {
      transactionId = body.merchant_txn_id || url.searchParams.get('txn_id');
      gatewayTransactionId = body.upay_txn_id;
      const upayStatus = url.searchParams.get('status') || body.status;
      
      console.log('Upay callback:', { merchant_txn_id: transactionId, status: upayStatus });
      
      if (upayStatus === 'success' || body.status === 'SUCCESS') {
        paymentStatus = 'completed';
      } else if (upayStatus === 'cancel') {
        paymentStatus = 'cancelled';
      } else {
        paymentStatus = 'failed';
      }
    }
    // Handle manual verification
    else if (gateway === 'manual') {
      transactionId = body.transaction_id;
      gatewayTransactionId = body.gateway_txn_id;
      paymentStatus = body.verified ? 'completed' : 'failed';
    }

    console.log('Processing transaction update:', { transactionId, gatewayTransactionId, paymentStatus });

    if (transactionId) {
      // Update payment transaction
      const { error: txnError } = await supabase
        .from('payment_transactions')
        .update({
          status: paymentStatus,
          gateway_transaction_id: gatewayTransactionId,
          payment_date: new Date().toISOString(),
        })
        .eq('transaction_id', transactionId);

      if (txnError) {
        console.error('Transaction update error:', txnError);
      }

      // Get the transaction to update related records
      const { data: transaction } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('transaction_id', transactionId)
        .single();

      if (transaction && paymentStatus === 'completed') {
        // Update donation or fee status based on payment type
        if (transaction.payment_type === 'donation' && transaction.reference_id) {
          await supabase
            .from('donations')
            .update({
              payment_status: 'completed',
              transaction_id: gatewayTransactionId || transactionId,
            })
            .eq('donation_id', transaction.reference_id);
        } else if (transaction.payment_type === 'fee' && transaction.reference_id) {
          // For fee payments, update the student_fees record
          const { data: feeRecord } = await supabase
            .from('student_fees')
            .select('*')
            .eq('id', transaction.reference_id)
            .single();

          if (feeRecord) {
            const newPaidAmount = (feeRecord.paid_amount || 0) + transaction.amount;
            const newDueAmount = feeRecord.amount - newPaidAmount;
            let newStatus = 'partial';
            
            if (newDueAmount <= 0) {
              newStatus = 'paid';
            }

            await supabase
              .from('student_fees')
              .update({
                paid_amount: newPaidAmount,
                due_amount: newDueAmount > 0 ? newDueAmount : 0,
                status: newStatus,
              })
              .eq('id', transaction.reference_id);
          }
        }
      }
    }

    // Build redirect URL with proper encoding
    const redirectPath = paymentStatus === 'completed' 
      ? `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}payment=success&txn=${encodeURIComponent(transactionId || '')}`
      : `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}payment=${paymentStatus}&txn=${encodeURIComponent(transactionId || '')}`;

    console.log('Redirecting to:', redirectPath);

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectPath,
      },
    });

  } catch (error) {
    console.error('Payment callback error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
