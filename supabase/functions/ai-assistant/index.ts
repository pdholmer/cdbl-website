import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Rate limiting store (in-memory, resets on function restart)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 10;

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again in an hour.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch context data
    const [programsRes, faqsRes, siteContentRes, supportRes] = await Promise.all([
      supabase.from('programs').select('*, divisions(*)'),
      supabase.from('faqs').select('*').order('display_order'),
      supabase.from('site_content').select('*').order('page, section, display_order'),
      supabase.from('support_options').select('*').eq('active', true).order('display_order')
    ]);

    // Organize site content by page and section for better context
    const siteContentByPage = (siteContentRes.data || []).reduce((acc: any, item: any) => {
      if (!acc[item.page]) acc[item.page] = {};
      if (!acc[item.page][item.section]) acc[item.page][item.section] = [];
      acc[item.page][item.section].push({
        key: item.content_key,
        value: item.content_value,
        type: item.content_type
      });
      return acc;
    }, {});

    const contextInfo = `
You are a helpful assistant for Carmel Dads' Baseball League (CDBL). Use this information to answer questions:

WEBSITE CONTENT (organized by page and section):
${JSON.stringify(siteContentByPage, null, 2)}

PROGRAMS:
${JSON.stringify(programsRes.data, null, 2)}

DIVISIONS:
${programsRes.data?.map((p: any) => p.divisions).flat().map((d: any) => `${d.name}: ${d.age_range}`).join(', ')}

FAQS:
${JSON.stringify(faqsRes.data, null, 2)}

SUPPORT OPTIONS:
${JSON.stringify(supportRes.data, null, 2)}

Answer questions clearly and concisely using the website content and data above. If you're not sure about something, guide users to contact CDBL directly at the contact information found in the site content.
    `.trim();

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: contextInfo },
          ...messages
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('AI Gateway request failed');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('AI Assistant error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
