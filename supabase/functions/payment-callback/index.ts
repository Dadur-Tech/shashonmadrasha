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

    // Handle SSLCommerz callback
    if (gateway === 'sslcommerz') {
      transactionId = body.tran_id;
      gatewayTransactionId = body.val_id || body.bank_tran_id;
      returnUrl = body.value_a || returnUrl;
      
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
      
      if (body.pay_status === 'Successful') {
        paymentStatus = 'completed';
      } else if (status === 'cancel') {
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

    // Redirect user back to the app
    const redirectPath = paymentStatus === 'completed' 
      ? `${returnUrl}?payment=success&txn=${transactionId}`
      : `${returnUrl}?payment=${paymentStatus}&txn=${transactionId}`;

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
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
