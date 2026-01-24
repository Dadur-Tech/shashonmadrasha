import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DonationRequest {
  donor_name: string;
  donor_phone: string;
  donor_email?: string;
  amount: number;
  category: string;
  payment_gateway: string;
  is_anonymous: boolean;
  notes?: string;
}

function generateDonationId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `DON-${year}-${random}`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body: DonationRequest = await req.json();
    const { donor_name, donor_phone, donor_email, amount, category, payment_gateway, is_anonymous, notes } = body;

    // =====================================================
    // INPUT VALIDATION
    // =====================================================
    
    // Validate donor name
    if (!donor_name || donor_name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Invalid donor name", message: "দাতার নাম কমপক্ষে ২ অক্ষর হতে হবে" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate phone number (Bangladesh format or international)
    const phoneRegex = /^(\+?880|0)?1[3-9]\d{8}$/;
    if (!donor_phone || !phoneRegex.test(donor_phone.replace(/[\s-]/g, ''))) {
      return new Response(
        JSON.stringify({ error: "Invalid phone", message: "সঠিক ফোন নম্বর দিন" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate amount (min 10 BDT, max 100,000,000 BDT)
    if (!amount || amount < 10 || amount > 100000000) {
      return new Response(
        JSON.stringify({ error: "Invalid amount", message: "দানের পরিমাণ ১০ থেকে ১০,০০,০০,০০০ টাকার মধ্যে হতে হবে" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate category
    const validCategories = ['lillah_boarding', 'orphan_support', 'madrasa_development', 'general', 'zakat', 'sadaqah', 'fitra'];
    if (!category || !validCategories.includes(category)) {
      return new Response(
        JSON.stringify({ error: "Invalid category", message: "সঠিক ক্যাটাগরি নির্বাচন করুন" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate payment gateway
    const validGateways = ['bkash', 'nagad', 'rocket', 'upay', 'sslcommerz', 'amarpay', 'manual'];
    if (!payment_gateway || !validGateways.includes(payment_gateway)) {
      return new Response(
        JSON.stringify({ error: "Invalid gateway", message: "সঠিক পেমেন্ট মাধ্যম নির্বাচন করুন" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =====================================================
    // RATE LIMITING - Max 5 donations per phone per day
    // =====================================================
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recentDonations, error: countError } = await supabase
      .from('donations')
      .select('id', { count: 'exact', head: true })
      .eq('donor_phone', donor_phone)
      .gte('created_at', oneDayAgo);

    if (countError) {
      console.error('Rate limit check error:', countError);
    }

    if (recentDonations && recentDonations >= 5) {
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded", 
          message: "আপনি আজকে সর্বোচ্চ ৫টি দান করতে পারবেন। পরে আবার চেষ্টা করুন।" 
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // =====================================================
    // CREATE DONATION RECORD
    // =====================================================
    const donationId = generateDonationId();
    const sanitizedName = is_anonymous ? "বেনামী দাতা" : donor_name.trim();

    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        donation_id: donationId,
        donor_name: sanitizedName,
        donor_phone: donor_phone.trim(),
        donor_email: donor_email?.trim() || null,
        amount: amount,
        category: category,
        payment_gateway: payment_gateway,
        payment_status: 'pending',
        is_anonymous: is_anonymous || false,
        notes: notes?.trim() || null,
      })
      .select()
      .single();

    if (donationError) {
      console.error('Donation creation error:', donationError);
      return new Response(
        JSON.stringify({ error: "Database error", message: "দান তৈরিতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        donation_id: donationId,
        id: donation.id,
        message: "দান সফলভাবে তৈরি হয়েছে" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Process donation error:', error);
    return new Response(
      JSON.stringify({ error: "Server error", message: "সার্ভার সমস্যা। পরে চেষ্টা করুন।" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
