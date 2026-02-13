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

// CORS: For production, restrict Access-Control-Allow-Origin to your domain
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

    // Fetch only relevant context data to minimize token usage
    const [programsRes, faqsRes, siteContentRes, supportRes] = await Promise.all([
      supabase.from('programs').select('name, type, description, active, divisions(name, age_range, description)').eq('active', true),
      supabase.from('faqs').select('question, answer, category').order('display_order').limit(20),
      supabase.from('site_content').select('page, section, content_key, content_value').order('page, section, display_order'),
      supabase.from('support_options').select('title, description, type, url').eq('active', true).order('display_order')
    ]);

    // Filter site content to current page and common content for relevance
    const relevantContent = (siteContentRes.data || []).filter((item: any) => {
      const page = item.page?.toLowerCase() || '';
      return page === currentPage || page === 'common' || page === 'home';
    });

    // Build compact site content summary
    const contentSummary = relevantContent.reduce((acc: any, item: any) => {
      const key = `${item.page}/${item.section}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(`${item.content_key}: ${item.content_value}`);
      return acc;
    }, {});

    // Build role-specific context
    let roleContext = '';
    if (isAdmin) {
      roleContext = 'User role: ADMIN (full access to all features, user management, programs, drafts, reports, site content).';
    } else if (isBoardMember) {
      roleContext = 'User role: BOARD MEMBER (manages players, teams, coaches, schedule, feedback; no access to drafts/reports/site content).';
    } else if (isCoach) {
      roleContext = 'User role: COACH (views assigned teams/players, participates in drafts).';
    } else if (isParent) {
      roleContext = 'User role: PARENT (registers children, views schedules and team info).';
    } else {
      roleContext = 'User role: PUBLIC VISITOR (browses general info, schedules, registration details).';
    }

    // Build page-specific context
    let pageContext = `Current page: ${currentPage} (${currentModule} section).`;

    // Build compact programs summary
    const programsSummary = (programsRes.data || []).map((p: any) => ({
      name: p.name,
      type: p.type,
      description: p.description,
      divisions: p.divisions?.map((d: any) => `${d.name} (${d.age_range})`).join(', ')
    }));

    // Build compact FAQ list
    const faqsSummary = (faqsRes.data || []).map((f: any) => `Q: ${f.question} A: ${f.answer}`).join('\n');

    // Build compact support options
    const supportSummary = (supportRes.data || []).map((s: any) => `${s.title}: ${s.description}`).join('\n');

    const contextInfo = `
You are a helpful assistant for Central District Baseball League (CDBL), a youth baseball league in Plato Center, IL.

${roleContext}
${pageContext}

PROGRAMS:
${JSON.stringify(programsSummary)}

RELEVANT PAGE CONTENT:
${JSON.stringify(contentSummary)}

FAQS:
${faqsSummary}

SUPPORT OPTIONS:
${supportSummary}

GUIDELINES:
- Tailor responses to the user's role and current page
- Be concise but helpful
- If unsure, direct users to contact CDBL at Communications@cdbaseball.org or visit the Contact page
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
