import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3.23.8'
import { sendTemplateEmail } from '../_shared/transactional-email-templates/send-email.ts'

// Email two-step sign-in. POST with { action }: send | verify | trust_check | forget_device.
// Caller must be signed in (password step done) and hold a role that requires_mfa.
const CODE_TTL_MIN = 10
const RESEND_GAP_SEC = 60
const MAX_SENDS_PER_HOUR = 10
const MAX_WRONG = 5
const LOCK_MIN = 15
const SESSION_HOURS = 12
const TRUST_DAYS = 30

const Body = z.discriminatedUnion('action', [
  z.object({ action: z.literal('send') }),
  z.object({ action: z.literal('verify'), code: z.string().regex(/^\d{6}$/), trustDevice: z.boolean().optional().default(false) }),
  z.object({ action: z.literal('trust_check'), deviceToken: z.string().regex(/^[A-Za-z0-9_-]{32,128}$/) }),
  z.object({ action: z.literal('forget_device'), deviceToken: z.string().regex(/^[A-Za-z0-9_-]{32,128}$/).optional() }),
])

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

const enc = new TextEncoder()
async function hmac(value: string): Promise<string> {
  const pepper = Deno.env.get('MFA_CODE_PEPPER')
  if (!pepper) throw new Error('MFA_CODE_PEPPER missing')
  const key = await crypto.subtle.importKey('raw', enc.encode(pepper), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(value)))
  return Array.from(sig, (b) => b.toString(16).padStart(2, '0')).join('')
}
function sameText(a: string, b: string) {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}
function sixDigits() {
  const buf = new Uint32Array(1)
  let n: number
  do { crypto.getRandomValues(buf); n = buf[0] } while (n >= 4_294_000_000) // avoid modulo bias
  return String(n % 1_000_000).padStart(6, '0')
}
function randomToken() {
  const b = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function sessionIdFrom(jwt: string): string | null {
  try {
    const p = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof p.session_id === 'string' ? p.session_id : null
  } catch { return null }
}
const plus = (ms: number) => new Date(Date.now() + ms).toISOString()

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const auth = req.headers.get('Authorization') ?? ''
  const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!jwt) return json({ error: 'unauthorized' }, 401)

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  // getUser validates the token with the auth server (and that its session is live).
  const { data: u, error: uErr } = await db.auth.getUser(jwt)
  if (uErr || !u.user) return json({ error: 'unauthorized' }, 401)
  const user = u.user
  const sessionId = sessionIdFrom(jwt)
  if (!sessionId) return json({ error: 'unauthorized' }, 401)

  let raw: unknown
  try { raw = await req.json() } catch { return json({ error: 'bad_request' }, 400) }
  const parsed = Body.safeParse(raw)
  if (!parsed.success) return json({ error: 'invalid', fields: parsed.error.flatten().fieldErrors }, 400)
  const body = parsed.data

  const { data: roles } = await db.from('user_roles').select('role').eq('user_id', user.id)
  const covered = (roles ?? []).some((r) => ['admin', 'registrar', 'treasurer', 'background_checks', 'commissioner', 'board_member'].includes(r.role))
  if (!covered) return json({ error: 'not_required' }, 403)

  const { data: leagueId } = await db.rpc('current_league_id')
  if (!leagueId) return json({ error: 'server_error' }, 500)

  const markVerified = (method: 'email_code' | 'trusted_device') =>
    db.from('mfa_verified_sessions').upsert({
      session_id: sessionId, league_id: leagueId, user_id: user.id, method,
      verified_at: new Date().toISOString(), expires_at: plus(SESSION_HOURS * 3600_000),
    })

  const lockedUntil = async () => {
    const { data } = await db.from('mfa_email_lockouts').select('locked_until').eq('user_id', user.id).maybeSingle()
    return data?.locked_until && new Date(data.locked_until) > new Date() ? data.locked_until as string : null
  }

  if (body.action === 'send') {
    if (!user.email) return json({ error: 'no_email' }, 400)
    const lock = await lockedUntil()
    if (lock) return json({ error: 'locked', until: lock }, 423)
    const hourAgo = new Date(Date.now() - 3600_000).toISOString()
    const { data: recent } = await db.from('mfa_email_challenges')
      .select('created_at').eq('user_id', user.id).gte('created_at', hourAgo).order('created_at', { ascending: false })
    if (recent && recent.length) {
      const wait = RESEND_GAP_SEC - Math.floor((Date.now() - new Date(recent[0].created_at).getTime()) / 1000)
      if (wait > 0) return json({ error: 'too_soon', retryAfter: wait }, 429)
      if (recent.length >= MAX_SENDS_PER_HOUR) return json({ error: 'hourly_limit' }, 429)
    }
    // Only the newest code is valid.
    await db.from('mfa_email_challenges').update({ superseded_at: new Date().toISOString() })
      .eq('user_id', user.id).is('consumed_at', null).is('superseded_at', null)
    const id = crypto.randomUUID()
    const code = sixDigits()
    const { error: insErr } = await db.from('mfa_email_challenges').insert({
      id, league_id: leagueId, user_id: user.id, code_hash: await hmac(`${id}:${code}`),
      expires_at: plus(CODE_TTL_MIN * 60_000),
    })
    if (insErr) return json({ error: 'server_error' }, 500)
    try {
      const r = await sendTemplateEmail('sign-in-code', user.email, {
        templateData: { code, minutes: CODE_TTL_MIN }, idempotencyKey: `sign-in-code-${id}`,
      })
      if (!r.sent) return json({ error: 'email_blocked' }, 409)
    } catch (e) {
      console.error('sign-in code send failed', e)
      return json({ error: 'email_failed' }, 502)
    }
    const [name, domain] = user.email.split('@')
    return json({ ok: true, sentTo: `${name.slice(0, 2)}…@${domain}`, retryAfter: RESEND_GAP_SEC })
  }

  if (body.action === 'verify') {
    const lock = await lockedUntil()
    if (lock) return json({ error: 'locked', until: lock }, 423)
    const { data: ch } = await db.from('mfa_email_challenges')
      .select('id, code_hash, expires_at').eq('user_id', user.id)
      .is('consumed_at', null).is('superseded_at', null)
      .order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (!ch || new Date(ch.expires_at) <= new Date()) return json({ error: 'expired' }, 400)

    if (!sameText(await hmac(`${ch.id}:${body.code}`), ch.code_hash)) {
      const { data: lo } = await db.from('mfa_email_lockouts').select('failed_count, first_failed_at').eq('user_id', user.id).maybeSingle()
      const fresh = lo?.first_failed_at && Date.now() - new Date(lo.first_failed_at).getTime() < LOCK_MIN * 60_000
      const count = (fresh ? lo!.failed_count : 0) + 1
      const locked = count >= MAX_WRONG
      await db.from('mfa_email_lockouts').upsert({
        user_id: user.id, league_id: leagueId,
        failed_count: locked ? 0 : count,
        first_failed_at: fresh ? lo!.first_failed_at : new Date().toISOString(),
        locked_until: locked ? plus(LOCK_MIN * 60_000) : null,
        updated_at: new Date().toISOString(),
      })
      if (locked) {
        await db.from('mfa_email_challenges').update({ superseded_at: new Date().toISOString() }).eq('id', ch.id)
        return json({ error: 'locked', until: plus(LOCK_MIN * 60_000) }, 423)
      }
      return json({ error: 'wrong_code', triesLeft: MAX_WRONG - count }, 400)
    }

    await db.from('mfa_email_challenges').update({ consumed_at: new Date().toISOString() }).eq('id', ch.id)
    await db.from('mfa_email_lockouts').delete().eq('user_id', user.id)
    const { error: vErr } = await markVerified('email_code')
    if (vErr) return json({ error: 'server_error' }, 500)
    let deviceToken: string | undefined
    if (body.trustDevice) {
      deviceToken = randomToken()
      await db.from('mfa_trusted_devices').insert({
        league_id: leagueId, user_id: user.id, token_hash: await hmac(`device:${deviceToken}`),
        user_agent: (req.headers.get('user-agent') ?? '').slice(0, 300), expires_at: plus(TRUST_DAYS * 86400_000),
      })
    }
    return json({ ok: true, deviceToken })
  }

  if (body.action === 'trust_check') {
    const { data: dev } = await db.from('mfa_trusted_devices').select('id, expires_at, revoked_at')
      .eq('user_id', user.id).eq('token_hash', await hmac(`device:${body.deviceToken}`)).maybeSingle()
    if (!dev || dev.revoked_at || new Date(dev.expires_at) <= new Date()) return json({ ok: false })
    await db.from('mfa_trusted_devices').update({ last_used_at: new Date().toISOString() }).eq('id', dev.id)
    const { error: vErr } = await markVerified('trusted_device')
    if (vErr) return json({ error: 'server_error' }, 500)
    return json({ ok: true })
  }

  // forget_device: one device by token, or every device for this account.
  let q = db.from('mfa_trusted_devices').update({ revoked_at: new Date().toISOString() }).eq('user_id', user.id).is('revoked_at', null)
  if (body.deviceToken) q = q.eq('token_hash', await hmac(`device:${body.deviceToken}`))
  await q
  return json({ ok: true })
})
