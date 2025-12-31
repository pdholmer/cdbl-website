import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedbackId, feedbackType, subject, description, module, priority } = await req.json();

    if (!feedbackId || !feedbackType || !subject || !description) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context based on feedback type
    let context = '';
    switch (feedbackType) {
      case 'bug_report':
        context = `This is a bug report${priority ? ` with ${priority} severity` : ''}${module ? ` from the ${module} module` : ''}.`;
        break;
      case 'feature_request':
        context = `This is a feature request${priority ? ` marked as ${priority} importance` : ''}${module ? ` for the ${module} module` : ''}.`;
        break;
      case 'feature_rating':
        context = `This is feature feedback/rating${module ? ` for the ${module} feature` : ''}.`;
        break;
      default:
        context = `This is general feedback${module ? ` about the ${module} module` : ''}.`;
    }

    const systemPrompt = `You are an expert software development assistant. Your task is to analyze user feedback and generate a clear, actionable prompt for developers.

Given user feedback, generate a 2-4 sentence prompt that:
1. Summarizes the core issue or request
2. Identifies the likely affected component/module
3. Suggests a concrete action or investigation path
4. Is written for a developer to immediately understand and act upon

Keep the response concise and technical. Focus on actionable next steps.`;

    const userPrompt = `${context}

Subject: ${subject}

Description: ${description}

Generate an actionable developer prompt for this feedback.`;

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to generate prompt' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const recommendedPrompt = aiResponse.choices?.[0]?.message?.content || '';

    // Update the feedback record with the generated prompt
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from('platform_feedback')
      .update({
        recommended_prompt: recommendedPrompt,
        prompt_generated_at: new Date().toISOString(),
      })
      .eq('id', feedbackId);

    if (updateError) {
      console.error('Failed to update feedback:', updateError);
    }

    return new Response(
      JSON.stringify({ success: true, prompt: recommendedPrompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-feedback-prompt:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
