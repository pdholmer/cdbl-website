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
        JSON.stringify({ 
          error: 'rate_limited',
          message: 'You\'ve sent too many requests. Please try again in an hour.' 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract context info
    const currentPage = context?.page || 'unknown';
    const currentModule = context?.module || 'public';
    const userRoles: string[] = context?.userRoles || [];
    
    // Determine user access level for customizing responses
    const isAdmin = userRoles.includes('admin');
    const isBoardMember = userRoles.includes('board_member');
    const isCoach = userRoles.includes('coach');
    const isParent = userRoles.includes('parent');
    const isAuthenticated = userRoles.length > 0;

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

    // Build role-specific context
    let roleContext = '';
    if (isAdmin) {
      roleContext = `
The user is an ADMIN. They have full access to all features and can:
- Manage users, roles, and permissions
- Configure programs, divisions, and drafts
- Access all reports and settings
- Manage site content and FAQs`;
    } else if (isBoardMember) {
      roleContext = `
The user is a BOARD MEMBER. They can:
- Manage players, teams, coaches, and schedule
- View and respond to feedback
- Access admin dashboard features (but not admin-only areas like drafts, reports, site content)`;
    } else if (isCoach) {
      roleContext = `
The user is a COACH. They can:
- View their assigned teams and players
- Participate in player drafts when assigned
- Access coach-specific resources`;
    } else if (isParent) {
      roleContext = `
The user is a registered PARENT. They can:
- Register their children for programs
- View schedules and team information
- Access parent resources`;
    } else {
      roleContext = `
The user is a PUBLIC VISITOR (not logged in). They can:
- Browse general information about CDBL
- View public schedules and team info
- Learn about registration and programs`;
    }

    // Build page-specific context
    let pageContext = '';
    if (currentModule === 'admin') {
      pageContext = `The user is currently in the ADMIN section of the website (page: ${currentPage}). Provide help relevant to administrative tasks.`;
    } else if (currentModule === 'coach') {
      pageContext = `The user is currently in the COACH section (page: ${currentPage}). Provide help relevant to coaching tasks.`;
    } else if (currentModule === 'in-house') {
      pageContext = `The user is currently viewing IN-HOUSE LEAGUE information (page: ${currentPage}). Focus answers on the In-House program.`;
    } else if (currentModule === 'travel') {
      pageContext = `The user is currently viewing TRAVEL TEAM information (page: ${currentPage}). Focus answers on the Travel program.`;
    } else {
      pageContext = `The user is on the public website (page: ${currentPage}).`;
    }

    const contextInfo = `
You are a helpful assistant for Carmel Dads' Baseball League (CDBL). Use this information to answer questions:

USER CONTEXT:
${roleContext}

PAGE CONTEXT:
${pageContext}

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

IMPORTANT GUIDELINES:
- Tailor your responses to the user's role and current page context
- For admin/board member questions, provide detailed administrative guidance
- For public visitors, focus on registration, programs, and general info
- If you're not sure about something, guide users to contact CDBL directly
- Be concise but helpful
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

    // Handle specific error codes from AI Gateway
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'credits_exhausted',
            message: 'The AI assistant is temporarily unavailable. Please visit our FAQ page or contact us directly for help.'
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'gateway_rate_limited',
            message: 'The AI service is experiencing high demand. Please try again in a few minutes.'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
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
      JSON.stringify({ 
        error: 'server_error',
        message: 'Something went wrong. Please try again or visit our Contact page for assistance.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
