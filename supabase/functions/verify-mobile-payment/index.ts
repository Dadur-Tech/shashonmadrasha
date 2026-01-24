import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  transaction_id: string;
  gateway_txn_id: string;
  sender_number: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header for authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract and verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin or accountant role
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('Roles error:', rolesError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify user permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const roles = userRoles?.map(r => r.role) || [];
    const isAuthorized = roles.includes('super_admin') || 
                         roles.includes('admin') || 
                         roles.includes('accountant');

    if (!isAuthorized) {
      console.warn(`Unauthorized payment verification attempt by user: ${user.id}`);
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Only admins and accountants can verify payments.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: VerifyRequest = await req.json();
    const { transaction_id, gateway_txn_id, sender_number } = body;

    if (!transaction_id || !gateway_txn_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the pending transaction
    const { data: transaction, error: txnError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('transaction_id', transaction_id)
      .eq('status', 'pending')
      .single();

    if (txnError || !transaction) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found or already processed' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update transaction as completed with verified_by tracking
    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({
        status: 'completed',
        gateway_transaction_id: gateway_txn_id,
        payment_date: new Date().toISOString(),
        notes: sender_number ? `প্রেরকের নম্বর: ${sender_number}` : null,
        verified_by: user.id,
      })
      .eq('transaction_id', transaction_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update related donation or fee
    if (transaction.payment_type === 'donation' && transaction.reference_id) {
      await supabase
        .from('donations')
        .update({
          payment_status: 'completed',
          transaction_id: gateway_txn_id,
        })
        .eq('donation_id', transaction.reference_id);
    } else if (transaction.payment_type === 'fee' && transaction.reference_id) {
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

    console.log(`Payment verified: ${transaction_id} by user: ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment verified successfully',
        transaction_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Verify payment error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
