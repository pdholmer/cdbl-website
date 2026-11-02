import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3.23.8'
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'

// Submits a help request the person confirmed by tapping "Send request".
// Signed-out visitors allowed; input validated and limited here.
const Body = z.object({
  sessionKey: z.string().regex(/^[A-Za-z0-9-]{16,64}$/),
  website: z.string().max(0).optional(), // honeypot must be empty
  kind: z.enum(['help', 'problem', 'feedback']),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  summary: z.string().trim().min(1).max(300),
  details: z.string().trim().max(4000).optional().default(''),
  page: z.string().trim().max(300).optional().default(''),
})

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  let raw: unknown
  try { raw = await req.json() } catch { return json({ error: 'bad_request' }, 400) }
  const parsed = Body.safeParse(raw)
  if (!parsed.success) return json({ error: 'invalid', fields: parsed.error.flatten().fieldErrors }, 400)
  const d = parsed.data

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: leagueId } = await supabase.rpc('current_league_id')
  if (!leagueId) return json({ error: 'server_error' }, 500)

  const { data: convo } = await supabase.from('assistant_conversations')
    .select('id').eq('session_key', d.sessionKey).maybeSingle()
  if (!convo) return json({ error: 'no_conversation', message: 'Please start the request in the chat.' }, 400)

  const { count } = await supabase.from('assistant_requests')
    .select('id', { count: 'exact', head: true }).eq('conversation_id', convo.id)
  if ((count ?? 0) >= 3) return json({ error: 'limit', message: 'This chat has already sent 3 requests.' }, 429)

  const { data: row, error } = await supabase.from('assistant_requests').insert({
    league_id: leagueId, conversation_id: convo.id, kind: d.kind,
    requester_name: d.name, requester_email: d.email, summary: d.summary,
    details: d.details || null, page_path: d.page || null,
  }).select('id').single()
  if (error || !row) { console.error('insert failed', error); return json({ error: 'server_error' }, 500) }

  let emailed = false
  try {
    const result = await sendTemplateEmail('new-help-request', 'pdholmer@gmail.com', {
      templateData: {
        kind: d.kind, name: d.name, email: d.email, summary: d.summary, details: d.details, page: d.page,
        link: `https://www.cdbaseball.org/admin/requests/${row.id}`,
      },
      idempotencyKey: `new-help-request-${row.id}`,
      replyTo: d.email,
    })
    emailed = result.sent
    if (emailed) await supabase.from('assistant_requests').update({ owner_emailed_at: new Date().toISOString() }).eq('id', row.id)
  } catch (e) {
    // The request is saved either way; the admin page shows it.
    console.error('owner alert failed', e)
  }

  return json({ ok: true, id: row.id, emailed })
})
