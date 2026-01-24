import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdmissionRequest {
  fullName: string;
  fatherName: string;
  motherName?: string;
  guardianName?: string;
  guardianPhone: string;
  guardianRelation?: string;
  dateOfBirth?: string;
  address?: string;
  village?: string;
  postOffice?: string;
  upazila?: string;
  district?: string;
  classId: string;
  previousInstitution?: string;
  isOrphan?: boolean;
  isLillah?: boolean;
  lillahReason?: string;
  bloodGroup?: string;
}

// Rate limiting: track submissions per phone number
const submissionTimestamps: Map<string, number[]> = new Map();
const MAX_SUBMISSIONS_PER_HOUR = 3;

function isRateLimited(phone: string): boolean {
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);
  
  const timestamps = submissionTimestamps.get(phone) || [];
  const recentTimestamps = timestamps.filter(t => t > hourAgo);
  
  if (recentTimestamps.length >= MAX_SUBMISSIONS_PER_HOUR) {
    return true;
  }
  
  recentTimestamps.push(now);
  submissionTimestamps.set(phone, recentTimestamps);
  return false;
}

function generateStudentId(): string {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `STU-${year}-${random}`;
}

// Validate phone number (Bangladesh format)
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^01[3-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ''));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: AdmissionRequest = await req.json();

    // Validate required fields
    if (!body.fullName || !body.fatherName || !body.guardianPhone || !body.classId) {
      return new Response(
        JSON.stringify({ error: 'প্রয়োজনীয় তথ্য পূরণ করুন (নাম, পিতার নাম, মোবাইল, ক্লাস)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone format
    const cleanPhone = body.guardianPhone.replace(/\s|-/g, '');
    if (!isValidPhone(cleanPhone)) {
      return new Response(
        JSON.stringify({ error: 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting
    if (isRateLimited(cleanPhone)) {
      return new Response(
        JSON.stringify({ error: 'অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate class exists and is active
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id, name')
      .eq('id', body.classId)
      .eq('is_active', true)
      .single();

    if (classError || !classData) {
      return new Response(
        JSON.stringify({ error: 'নির্বাচিত ক্লাস পাওয়া যায়নি' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize text inputs
    const sanitize = (str?: string) => str ? str.trim().slice(0, 200) : null;

    const studentId = generateStudentId();

    // Insert student
    const { data: student, error: insertError } = await supabase
      .from('students')
      .insert({
        student_id: studentId,
        full_name: sanitize(body.fullName)!,
        father_name: sanitize(body.fatherName)!,
        mother_name: sanitize(body.motherName),
        guardian_name: sanitize(body.guardianName),
        guardian_phone: cleanPhone,
        guardian_relation: sanitize(body.guardianRelation),
        date_of_birth: body.dateOfBirth || null,
        address: sanitize(body.address),
        village: sanitize(body.village),
        post_office: sanitize(body.postOffice),
        upazila: sanitize(body.upazila),
        district: sanitize(body.district),
        class_id: body.classId,
        previous_institution: sanitize(body.previousInstitution),
        is_orphan: body.isOrphan || false,
        is_lillah: body.isLillah || false,
        lillah_reason: sanitize(body.lillahReason),
        blood_group: body.bloodGroup || null,
        status: 'active',
      })
      .select('student_id')
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'আবেদন প্রক্রিয়ায় সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`New admission: ${studentId} for class ${classData.name}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        studentId: studentId,
        message: `ভর্তি আবেদন সফল হয়েছে। ছাত্র আইডি: ${studentId}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admission error:', error);
    return new Response(
      JSON.stringify({ error: 'আবেদন প্রক্রিয়ায় সমস্যা হয়েছে' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
