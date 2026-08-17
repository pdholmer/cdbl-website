// Drains the notification_queue. Admin/board only.
//
// Contract (from the migration comments + spec):
//   - One queue, one draining path.
//   - One digest per family, never one message per child.
//   - Urgent priority bypasses category_opt_outs and quiet_hours, but NEVER
//     bypasses email_suppressions.
//   - From/reply-to come from the `leagues` row, never hardcoded.
//
// This function does not enqueue. It only drains rows already sitting in
// notification_queue with status='approved', or status='pending' AND
// requires_approval=false.

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const PUBLIC_SITE_URL = Deno.env.get("PUBLIC_SITE_URL") ?? "https://www.cdbaseball.org";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type QueueRow = {
  id: string;
  league_id: string;
  event_key: string;
  template_key: string | null;
  priority: "urgent" | "normal" | "digest";
  subject: string | null;
  body_markdown: string | null;
  payload: Record<string, any>;
  audience_description: string | null;
  requires_approval: boolean;
  status: string;
};

type ResolvedRecipient = {
  guardian_id: string | null;
  household_id: string | null;
  user_id: string | null;
  address: string;
  child_names: string[]; // children in THIS guardian's household matched by the audience
  unsubscribe_token: string | null;
  category_opt_outs: string[];
  email_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
};

function categoryFromEventKey(key: string): string {
  const [head] = key.split(".");
  return head || key;
}

function insideQuietHours(
  start: string | null,
  end: string | null,
  now: Date,
  tz: string,
): boolean {
  if (!start || !end) return false;
  // Compare wall-clock HH:MM:SS in the league timezone.
  const fmt = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: tz,
  });
  const parts = fmt.formatToParts(now);
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  const s = parts.find((p) => p.type === "second")?.value ?? "00";
  const cur = `${h}:${m}:${s}`;
  if (start <= end) return cur >= start && cur <= end;
  // Overnight window (e.g. 22:00 -> 07:00)
  return cur >= start || cur <= end;
}

function renderBody(
  q: QueueRow,
  child_names: string[],
  unsubscribeUrl: string | null,
  preferencesUrl: string,
): { html: string; text: string } {
  const bodyMd = q.body_markdown ?? "";
  const childBlock =
    child_names.length > 0
      ? `<p style="margin:0 0 12px 0;color:#334155"><strong>Regarding:</strong> ${child_names
          .map((n) => escapeHtml(n))
          .join(", ")}</p>`
      : "";

  const footer =
    q.priority === "urgent" || q.event_key.startsWith("auth.")
      ? `<p style="margin-top:32px;font-size:12px;color:#64748b">You received this because it is time-sensitive league communication. <a href="${preferencesUrl}" style="color:#64748b">Manage preferences</a>.</p>`
      : unsubscribeUrl
      ? `<p style="margin-top:32px;font-size:12px;color:#64748b"><a href="${preferencesUrl}" style="color:#64748b">Preferences</a> · <a href="${unsubscribeUrl}" style="color:#64748b">Unsubscribe</a></p>`
      : `<p style="margin-top:32px;font-size:12px;color:#64748b"><a href="${preferencesUrl}" style="color:#64748b">Preferences</a></p>`;

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
    <div style="max-width:600px;margin:0 auto;padding:32px 24px;background:#ffffff">
      ${childBlock}
      <div style="font-size:15px;line-height:1.6">${markdownishToHtml(bodyMd)}</div>
      ${footer}
    </div>
  </body></html>`;

  const text = `${
    child_names.length > 0 ? `Regarding: ${child_names.join(", ")}\n\n` : ""
  }${bodyMd}\n\n${
    q.priority === "urgent" || q.event_key.startsWith("auth.")
      ? `Preferences: ${preferencesUrl}`
      : unsubscribeUrl
      ? `Preferences: ${preferencesUrl}\nUnsubscribe: ${unsubscribeUrl}`
      : `Preferences: ${preferencesUrl}`
  }`;

  return { html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function markdownishToHtml(md: string): string {
  // Extremely small markdown-ish: paragraphs + bold/italic + links.
  const escaped = escapeHtml(md);
  const withLinks = escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" style="color:#1d4ed8">$1</a>',
  );
  const withBold = withLinks.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  const withItalic = withBold.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  return withItalic
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 12px 0">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  // ---- Auth: admin or board_member only ----
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json(401, { error: "Missing bearer token" });
  }
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(
    authHeader.replace("Bearer ", ""),
  );
  if (claimsErr || !claimsData?.claims?.sub) {
    return json(401, { error: "Invalid token" });
  }
  const uid = claimsData.claims.sub as string;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: hasAccess } = await admin.rpc("has_admin_access", {
    _user_id: uid,
  });
  if (!hasAccess) return json(403, { error: "Forbidden" });

  if (!RESEND_API_KEY) {
    // Build should succeed even without the secret. Explain what's missing.
    return json(503, {
      error: "RESEND_API_KEY is not configured. Add it in Project Settings → Secrets.",
    });
  }

  // ---- Load league (from/reply_to/timezone come from here, never hardcoded) ----
  const { data: leagueRow, error: leagueErr } = await admin
    .from("leagues")
    .select("id, timezone, sending_from_name, sending_from_address, reply_to_address")
    .eq("slug", "cdbl")
    .single();
  if (leagueErr || !leagueRow) return json(500, { error: "League not configured" });
  const league = leagueRow as {
    id: string;
    timezone: string;
    sending_from_name: string | null;
    sending_from_address: string | null;
    reply_to_address: string | null;
  };
  if (!league.sending_from_address) {
    return json(500, { error: "leagues.sending_from_address is required" });
  }
  const fromHeader = `${league.sending_from_name ?? "CDBL"} <${league.sending_from_address}>`;

  // ---- 1. Claim up to 50 rows atomically ----
  // Two-step claim: select candidates, then UPDATE with a status guard so
  // only one invocation wins per row. status enum ordering makes urgent<normal<digest.
  const { data: candidates, error: candErr } = await admin
    .from("notification_queue")
    .select("id")
    .eq("league_id", league.id)
    .or(
      "status.eq.approved,and(status.eq.pending,requires_approval.eq.false)",
    )
    .or("scheduled_for.is.null,scheduled_for.lte." + new Date().toISOString())
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(50);
  if (candErr) return json(500, { error: candErr.message });

  const ids = (candidates ?? []).map((r: any) => r.id);
  if (ids.length === 0) return json(200, { drained: 0 });

  const { data: claimed, error: claimErr } = await admin
    .from("notification_queue")
    .update({ status: "sending" })
    .in("id", ids)
    .in("status", ["approved", "pending"])
    .select("*");
  if (claimErr) return json(500, { error: claimErr.message });

  const rows = (claimed ?? []) as QueueRow[];
  let sent = 0;
  let failed = 0;
  let suppressed = 0;

  for (const q of rows) {
    try {
      // ---- 2. Resolve recipients from the audience payload ----
      const resolved = await resolveRecipients(admin, league.id, q);

      // ---- 3. Digest rule: one row per household, one email per guardian
      //         with the child list rolled up. Already handled inside resolver.

      const category = categoryFromEventKey(q.event_key);
      const now = new Date();

      // ---- 4/5. Suppressions + preferences ----
      const addresses = resolved.map((r) => r.address.toLowerCase());
      let suppressedSet = new Set<string>();
      if (addresses.length > 0) {
        const { data: sup } = await admin
          .from("email_suppressions")
          .select("email")
          .eq("league_id", league.id)
          .is("released_at", null)
          .in("email", addresses);
        suppressedSet = new Set(
          (sup ?? []).map((s: any) => String(s.email).toLowerCase()),
        );
      }

      const recipientInserts: any[] = [];
      const toSend: (ResolvedRecipient & { rowIndex: number })[] = [];

      resolved.forEach((r) => {
        const addr = r.address.toLowerCase();
        if (suppressedSet.has(addr)) {
          recipientInserts.push({
            queue_id: q.id,
            league_id: league.id,
            guardian_id: r.guardian_id,
            household_id: r.household_id,
            user_id: r.user_id,
            channel: "email",
            address: r.address,
            status: "suppressed",
            failure_reason: "address in email_suppressions",
          });
          suppressed++;
          return;
        }

        // Preference gates. Urgent bypasses everything except suppression.
        if (q.priority !== "urgent") {
          if (!r.email_enabled) {
            recipientInserts.push({
              queue_id: q.id,
              league_id: league.id,
              guardian_id: r.guardian_id,
              household_id: r.household_id,
              user_id: r.user_id,
              channel: "email",
              address: r.address,
              status: "suppressed",
              failure_reason: "email_enabled=false",
            });
            return;
          }
          if (r.category_opt_outs.includes(category)) {
            recipientInserts.push({
              queue_id: q.id,
              league_id: league.id,
              guardian_id: r.guardian_id,
              household_id: r.household_id,
              user_id: r.user_id,
              channel: "email",
              address: r.address,
              status: "suppressed",
              failure_reason: `opted out of ${category}`,
            });
            return;
          }
          if (
            insideQuietHours(
              r.quiet_hours_start,
              r.quiet_hours_end,
              now,
              league.timezone,
            )
          ) {
            recipientInserts.push({
              queue_id: q.id,
              league_id: league.id,
              guardian_id: r.guardian_id,
              household_id: r.household_id,
              user_id: r.user_id,
              channel: "email",
              address: r.address,
              status: "suppressed",
              failure_reason: "quiet hours",
            });
            return;
          }
        }

        toSend.push({ ...r, rowIndex: recipientInserts.length });
        recipientInserts.push({
          queue_id: q.id,
          league_id: league.id,
          guardian_id: r.guardian_id,
          household_id: r.household_id,
          user_id: r.user_id,
          channel: "email",
          address: r.address,
          status: "pending",
        });
      });

      // Insert pending/suppressed recipient rows in one shot
      let insertedIds: string[] = [];
      if (recipientInserts.length > 0) {
        const { data: inserted, error: insErr } = await admin
          .from("notification_recipients")
          .insert(recipientInserts)
          .select("id");
        if (insErr) throw insErr;
        insertedIds = (inserted ?? []).map((r: any) => r.id as string);
      }

      // ---- 6/7. Send via Resend ----
      for (const target of toSend) {
        const recipientId = insertedIds[target.rowIndex];
        const unsubscribeUrl =
          q.priority === "urgent" || q.event_key.startsWith("auth.")
            ? null
            : target.unsubscribe_token
            ? `${PUBLIC_SITE_URL}/unsubscribe?token=${target.unsubscribe_token}`
            : null;
        const preferencesUrl = `${PUBLIC_SITE_URL}/preferences${
          target.unsubscribe_token ? `?token=${target.unsubscribe_token}` : ""
        }`;

        const { html, text } = renderBody(
          q,
          target.child_names,
          unsubscribeUrl,
          preferencesUrl,
        );

        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromHeader,
            reply_to: league.reply_to_address ?? undefined,
            to: [target.address],
            subject: q.subject ?? "(no subject)",
            html,
            text,
            headers: unsubscribeUrl
              ? {
                  "List-Unsubscribe": `<${unsubscribeUrl}>`,
                  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                }
              : undefined,
            tags: [
              { name: "event", value: q.event_key },
              { name: "priority", value: q.priority },
              { name: "queue_id", value: q.id },
            ],
          }),
        });
        const respBody = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          await admin
            .from("notification_recipients")
            .update({
              status: "failed",
              failure_reason: `Resend ${resp.status}: ${JSON.stringify(respBody)}`,
            })
            .eq("id", recipientId);
          failed++;
          continue;
        }

        await admin
          .from("notification_recipients")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            provider_message_id: (respBody as any).id ?? null,
          })
          .eq("id", recipientId);
        sent++;
      }

      // ---- 9. Mark queue row sent ----
      await admin
        .from("notification_queue")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", q.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      await admin
        .from("notification_queue")
        .update({ status: "failed", error_message: msg })
        .eq("id", q.id);
      failed++;
    }
  }

  return json(200, {
    drained: rows.length,
    sent,
    failed,
    suppressed,
  });
});

// ============================================================
// Recipient resolution — the digest rule lives here.
// Returns ONE row per (household guardian) with an aggregated
// child_names list.
// ============================================================
async function resolveRecipients(
  admin: ReturnType<typeof createClient>,
  leagueId: string,
  q: QueueRow,
): Promise<ResolvedRecipient[]> {
  const payload = q.payload ?? {};
  const scope = String(payload.scope ?? "").toLowerCase();

  // household_id -> Set<child names matching audience>
  const householdChildren = new Map<string, Set<string>>();
  // household_id -> Set<guardian_id>
  const householdGuardians = new Map<string, Set<string>>();
  // Explicit-address audience skips the household resolver entirely.
  const explicitAddresses = new Set<string>();

  const addChild = (household_id: string, name: string) => {
    if (!householdChildren.has(household_id))
      householdChildren.set(household_id, new Set());
    householdChildren.get(household_id)!.add(name);
  };

  const addHouseholds = async (household_ids: string[]) => {
    if (household_ids.length === 0) return;
    const { data: gh } = await admin
      .from("guardian_households")
      .select("guardian_id, household_id, receives_comms")
      .in("household_id", household_ids);
    (gh ?? []).forEach((row: any) => {
      if (row.receives_comms === false) return;
      if (!householdGuardians.has(row.household_id))
        householdGuardians.set(row.household_id, new Set());
      householdGuardians.get(row.household_id)!.add(row.guardian_id);
    });
  };

  const collectHouseholdsForPlayers = async (
    playerIds: string[],
  ): Promise<string[]> => {
    if (playerIds.length === 0) return [];
    const { data: hp } = await admin
      .from("household_players")
      .select(
        "household_id, player_id, league_player:league_players!hp_league_player_fkey(player:players(first_name, preferred_name, last_name))",
      )
      .in("player_id", playerIds);
    const ids = new Set<string>();
    (hp ?? []).forEach((row: any) => {
      ids.add(row.household_id);
      const p = row.league_player?.player;
      if (p) {
        const first = p.preferred_name || p.first_name || "";
        const last = p.last_name || "";
        const name = `${first} ${last}`.trim();
        if (name) addChild(row.household_id, name);
      }
    });
    return Array.from(ids);
  };

  if (scope === "league") {
    const { data: gh } = await admin
      .from("guardian_households")
      .select("guardian_id, household_id, receives_comms")
      .eq("league_id", leagueId);
    (gh ?? []).forEach((row: any) => {
      if (row.receives_comms === false) return;
      if (!householdGuardians.has(row.household_id))
        householdGuardians.set(row.household_id, new Set());
      householdGuardians.get(row.household_id)!.add(row.guardian_id);
    });
  } else if (scope === "admins") {
    const { data: roles } = await admin
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "board_member"]);
    const userIds = (roles ?? []).map((r: any) => r.user_id);
    if (userIds.length > 0) {
      // Prefer guardians linked to these users; fall back to auth emails.
      const { data: guardians } = await admin
        .from("guardians")
        .select("id, email, auth_user_id")
        .in("auth_user_id", userIds);
      const covered = new Set<string>();
      (guardians ?? []).forEach((g: any) => {
        if (g.email) {
          explicitAddresses.add(g.email);
          covered.add(g.auth_user_id);
        }
      });
      // Users without a guardian record: use their auth email
      const missing = userIds.filter((u) => !covered.has(u));
      if (missing.length > 0) {
        const { data: profiles } = await admin
          .from("profiles")
          .select("id, email")
          .in("id", missing);
        (profiles ?? []).forEach((p: any) => {
          if (p.email) explicitAddresses.add(p.email);
        });
      }
    }
  } else if (scope === "explicit") {
    const emails = Array.isArray(payload.emails) ? payload.emails : [];
    emails.forEach((e: any) => {
      if (typeof e === "string" && e.includes("@")) explicitAddresses.add(e);
    });
  } else if (scope === "household") {
    const hid = payload.household_id;
    if (typeof hid === "string") await addHouseholds([hid]);
  } else if (scope === "guardians") {
    const gids: string[] = Array.isArray(payload.guardian_ids)
      ? payload.guardian_ids
      : [];
    if (gids.length > 0) {
      const { data: gh } = await admin
        .from("guardian_households")
        .select("guardian_id, household_id, receives_comms")
        .in("guardian_id", gids);
      (gh ?? []).forEach((row: any) => {
        if (row.receives_comms === false) return;
        if (!householdGuardians.has(row.household_id))
          householdGuardians.set(row.household_id, new Set());
        householdGuardians.get(row.household_id)!.add(row.guardian_id);
      });
    }
  } else if (scope === "team") {
    const tid = payload.team_id;
    if (typeof tid === "string") {
      const { data: roster } = await admin
        .from("team_rosters")
        .select("player_id")
        .eq("team_id", tid)
        .eq("status", "active");
      const playerIds = (roster ?? []).map((r: any) => r.player_id);
      const hhIds = await collectHouseholdsForPlayers(playerIds);
      await addHouseholds(hhIds);
    }
  } else if (scope === "division") {
    const did = payload.division_id;
    if (typeof did === "string") {
      const { data: teams } = await admin
        .from("teams")
        .select("id")
        .eq("division_id", did);
      const teamIds = (teams ?? []).map((t: any) => t.id);
      if (teamIds.length > 0) {
        const { data: roster } = await admin
          .from("team_rosters")
          .select("player_id")
          .in("team_id", teamIds)
          .eq("status", "active");
        const playerIds = (roster ?? []).map((r: any) => r.player_id);
        const hhIds = await collectHouseholdsForPlayers(playerIds);
        await addHouseholds(hhIds);
      }
    }
  }

  // Materialise resolved rows.
  const results: ResolvedRecipient[] = [];

  // Household-based recipients (one per guardian, child list rolled up)
  const allGuardianIds = new Set<string>();
  householdGuardians.forEach((set) => set.forEach((id) => allGuardianIds.add(id)));
  if (allGuardianIds.size > 0) {
    const gIds = Array.from(allGuardianIds);
    const { data: gRows } = await admin
      .from("guardians")
      .select("id, email, auth_user_id")
      .in("id", gIds);
    const { data: prefRows } = await admin
      .from("communication_preferences")
      .select(
        "guardian_id, email_enabled, category_opt_outs, quiet_hours_start, quiet_hours_end, unsubscribe_token",
      )
      .eq("league_id", leagueId)
      .in("guardian_id", gIds);
    const prefsByGuardian = new Map<string, any>();
    (prefRows ?? []).forEach((p: any) => prefsByGuardian.set(p.guardian_id, p));
    const guardianRowById = new Map<string, any>();
    (gRows ?? []).forEach((g: any) => guardianRowById.set(g.id, g));

    householdGuardians.forEach((guardianSet, householdId) => {
      const childSet = householdChildren.get(householdId) ?? new Set<string>();
      guardianSet.forEach((gid) => {
        const g = guardianRowById.get(gid);
        if (!g || !g.email) return;
        const pref = prefsByGuardian.get(gid);
        results.push({
          guardian_id: gid,
          household_id: householdId,
          user_id: g.auth_user_id ?? null,
          address: g.email,
          child_names: Array.from(childSet),
          unsubscribe_token: pref?.unsubscribe_token ?? null,
          category_opt_outs: pref?.category_opt_outs ?? [],
          email_enabled: pref?.email_enabled ?? true,
          quiet_hours_start: pref?.quiet_hours_start ?? null,
          quiet_hours_end: pref?.quiet_hours_end ?? null,
        });
      });
    });
  }

  // Explicit-address recipients — no household, no child list.
  explicitAddresses.forEach((addr) => {
    results.push({
      guardian_id: null,
      household_id: null,
      user_id: null,
      address: addr,
      child_names: [],
      unsubscribe_token: null,
      category_opt_outs: [],
      email_enabled: true,
      quiet_hours_start: null,
      quiet_hours_end: null,
    });
  });

  // Deduplicate by (address, guardian_id) — a guardian in two households
  // for the same team message is one email listing all children.
  const dedup = new Map<string, ResolvedRecipient>();
  for (const r of results) {
    const key = `${(r.guardian_id ?? "-")}::${r.address.toLowerCase()}`;
    const existing = dedup.get(key);
    if (!existing) {
      dedup.set(key, r);
    } else {
      const merged = new Set([...existing.child_names, ...r.child_names]);
      existing.child_names = Array.from(merged);
    }
  }
  return Array.from(dedup.values());
}
