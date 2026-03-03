import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting store (in-memory, resets on function restart)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 3;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  record.count++;
  return true;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

function sanitizeString(str: string, maxLength: number): string {
  return str.trim().slice(0, maxLength);
}

function validateFormData(data: any): { valid: boolean; error?: string } {
  // Honeypot check: if hidden fields are filled, it's a bot
  if (data._hp_website || data._hp_phone_alt) {
    // Silently reject but return success to not tip off bots
    return { valid: false, error: "__honeypot__" };
  }

  // Required fields validation
  if (!data.first_name || !data.last_name || !data.date_of_birth) {
    return { valid: false, error: "Missing required player information" };
  }
  
  if (!data.parent_email || !validateEmail(data.parent_email)) {
    return { valid: false, error: "Valid parent email is required" };
  }
  
  if (!data.parent_phone || data.parent_phone.length < 10) {
    return { valid: false, error: "Valid parent phone is required" };
  }
  
  // Length validations
  if (data.first_name.length > 100 || data.last_name.length > 100) {
    return { valid: false, error: "Name fields too long" };
  }
  
  if (data.medical_notes && data.medical_notes.length > 1000) {
    return { valid: false, error: "Medical notes too long" };
  }
  
  if (data.form_data && JSON.stringify(data.form_data).length > 50000) {
    return { valid: false, error: "Form data too large" };
  }
  
  return { valid: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ error: 'Too many registration attempts. Please try again in an hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.json();
    
    // Validate input
    const validation = validateFormData(formData);
    if (!validation.valid) {
      // If honeypot triggered, return fake success to not alert bots
      if (validation.error === "__honeypot__") {
        return new Response(
          JSON.stringify({ success: true, submission_id: "ok", message: "Registration submitted successfully." }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      first_name: sanitizeString(formData.first_name, 100),
      last_name: sanitizeString(formData.last_name, 100),
      date_of_birth: formData.date_of_birth,
      parent_email: sanitizeString(formData.parent_email, 255),
      parent_phone: sanitizeString(formData.parent_phone, 20),
      parent_first_name: sanitizeString(formData.parent_first_name || '', 100),
      parent_last_name: sanitizeString(formData.parent_last_name || '', 100),
      parent_guardian_name: sanitizeString(formData.parent_guardian_name || '', 200),
      address_line1: formData.address_line1 ? sanitizeString(formData.address_line1, 200) : null,
      address_line2: formData.address_line2 ? sanitizeString(formData.address_line2, 200) : null,
      city: formData.city ? sanitizeString(formData.city, 100) : null,
      state: formData.state || 'OH',
      zip_code: formData.zip_code ? sanitizeString(formData.zip_code, 10) : null,
      gender: formData.gender || null,
      medical_notes: formData.medical_notes ? sanitizeString(formData.medical_notes, 1000) : null,
      allergies: formData.allergies ? sanitizeString(formData.allergies, 500) : null,
      emergency_contact_name: formData.emergency_contact_name ? sanitizeString(formData.emergency_contact_name, 200) : null,
      emergency_contact_phone: formData.emergency_contact_phone ? sanitizeString(formData.emergency_contact_phone, 20) : null,
      emergency_contact_relationship: formData.emergency_contact_relationship ? sanitizeString(formData.emergency_contact_relationship, 100) : null,
      program_id: formData.program_id,
      division_id: formData.division_id,
      special_requests: formData.special_requests ? sanitizeString(formData.special_requests, 1000) : null,
    };

    // Create Supabase client with service role for INSERT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert registration submission
    const { data: submission, error: submissionError } = await supabase
      .from('registration_submissions')
      .insert({
        program_id: sanitizedData.program_id,
        form_data: sanitizedData,
        status: 'submitted',
        ip_address: ip,
        user_agent: req.headers.get('user-agent') || null,
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Submission error:', submissionError);
      throw submissionError;
    }

    console.log('Registration submitted successfully:', submission.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        submission_id: submission.id,
        message: 'Registration submitted successfully. You will receive a confirmation email shortly.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in register-player function:', error);
    const message = error instanceof Error ? error.message : 'Registration failed';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
