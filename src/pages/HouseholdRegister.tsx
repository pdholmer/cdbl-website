import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/shell/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusChip } from "@/components/family";
import { cn } from "@/lib/utils";
import { GRADES, gradeLabel, longDate, registrationWindow, todayISO } from "@/lib/registration";
import { toast } from "sonner";
import RegistrationForms, { type NextForm } from "@/components/family/RegistrationForms";
import PlayerPicker from "@/components/family/PlayerPicker";
import AddPlayerSheet from "@/components/family/AddPlayerSheet";
import { BuilderActionBar, BuilderHeaderExtra, BuilderLayout, BuilderStage } from "@/components/family/Builder";
import { useHouseholdOverview } from "@/hooks/useHouseholdOverview";

type Elig = {
  league_age: number | null;
  recommended_division_id: string | null;
  grade_division_id: string | null;
  age_division_id: string | null;
  conflict: boolean;
  reason: string | null;
  error?: string;
};
type Choice = "recommended" | "grade" | "age" | "review";

const PROGRAM_TYPES = ["in_house", "ihtt", "clinic"] as const;
const PROGRAM_LABEL: Record<string, string> = { in_house: "In-House", ihtt: "IHTT", clinic: "Clinic" };

const HouseholdRegister = () => {
  const { playerId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["register-setup", playerId],
    queryFn: async () => {
      const { data: player, error: pe } = await supabase
        .from("players").select("id, first_name, preferred_name, date_of_birth").eq("id", playerId!).maybeSingle();
      if (pe) throw pe;
      const { data: season, error: se } = await supabase
        .from("seasons")
        .select("id, year, age_cutoff_date, registration_opens_on, registration_closes_on, late_registration_until, registration_test_mode")
        .not("registration_opens_on", "is", null).order("year", { ascending: false }).limit(1).maybeSingle();
      if (se) throw se;
      const { data: programs, error: pre } = await supabase
        .from("programs").select("id, name, type, overview").eq("season_id", season?.id ?? "").in("type", [...PROGRAM_TYPES]);
      if (pre) throw pre;
      const ids = (programs ?? []).map((p) => p.id);
      const { data: divisions, error: de } = await supabase
        .from("divisions").select("id, program_id, name, display_label, description, typical_ages, cost").in("program_id", ids.length ? ids : [""]);
      if (de) throw de;
      const { data: regs, error: re } = await supabase
        .from("registrations").select("id, program_id, division_id, lifecycle, grade_at_registration, hold_reason")
        .eq("player_id", playerId!).eq("season_id", season?.id ?? "");
      if (re) throw re;
      const sorted = [...(programs ?? [])].sort((a, b) => PROGRAM_TYPES.indexOf(a.type as never) - PROGRAM_TYPES.indexOf(b.type as never));
      return { player, season, programs: sorted, divisions: divisions ?? [], regs: regs ?? [] };
    },
    enabled: !!playerId,
  });

  const [programId, setProgramId] = useState<string | null>(null);
  const [grade, setGrade] = useState<number | null>(null);
  const [elig, setElig] = useState<Elig | null>(null);
  const [choice, setChoice] = useState<Choice>("recommended");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const family = useHouseholdOverview();
  const [adding, setAdding] = useState(false);
  const [nextForm, setNextForm] = useState<NextForm>(null);
  const [formsReady, setFormsReady] = useState(false);

  useEffect(() => {
    if (!data) return;
    const existing = data.regs.find((r) => r.lifecycle !== "cancelled");
    if (!programId) setProgramId(existing?.program_id ?? data.programs[0]?.id ?? null);
    if (grade === null && existing?.grade_at_registration != null) setGrade(existing.grade_at_registration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    setElig(null); setChoice("recommended"); setErr(null);
    if (!programId || !data?.player?.date_of_birth || grade === null) return;
    let alive = true;
    supabase.rpc("division_eligibility", { _program_id: programId, _dob: data.player.date_of_birth, _grade: grade })
      .then(({ data: r, error: e }) => {
        if (!alive) return;
        if (e) setErr(e.message); else setElig(r as unknown as Elig);
      });
    return () => { alive = false; };
  }, [programId, grade, data?.player?.date_of_birth]);

  const divName = (id: string | null) => {
    const d = data?.divisions.find((x) => x.id === id);
    return d ? d.display_label ?? d.name : "";
  };
  const shownDivisionId = useMemo(() => {
    if (!elig) return null;
    if (choice === "grade") return elig.grade_division_id ?? elig.recommended_division_id;
    if (choice === "age") return elig.age_division_id ?? elig.recommended_division_id;
    return elig.recommended_division_id;
  }, [elig, choice]);
  const division = data?.divisions.find((d) => d.id === shownDivisionId);

  const s = data?.season;
  const win = s ? registrationWindow(todayISO(), s.registration_opens_on, s.registration_closes_on, s.late_registration_until, s.registration_test_mode) : "before";
  const canSave = (win === "open" || win === "late" || win === "test") && !!elig && !elig.error;
  const name = data?.player ? data.player.preferred_name || data.player.first_name : "Player";
  const existingForProgram = data?.regs.find((r) => r.program_id === programId && r.lifecycle !== "cancelled");

  const save = async () => {
    if (!programId || grade === null || !playerId) return;
    setSaving(true); setErr(null);
    const { error: e } = await supabase.rpc("start_my_registration", {
      _player_id: playerId, _program_id: programId, _grade: grade, _choice: choice,
    });
    setSaving(false);
    if (e) { setErr(e.message); return; }
    toast.success(choice === "review" ? "Saved. The registrar will review the division." : "Draft registration saved");
    refetch();
  };

  const conflictText = () => {
    if (!elig) return "";
    const g = divName(elig.grade_division_id), a = divName(elig.age_division_id);
    if (g && a) return `${name}'s grade (${gradeLabel(grade)}) points to ${g}, but age ${elig.league_age} on the league's cutoff date points to ${a}.`;
    return `${name}'s grade and age don't match one division exactly. We picked the closest one.`;
  };

  const goPay = async () => {
    if (!existingForProgram) return;
    const { error: ce } = await supabase.rpc("add_to_my_cart", { _registration_id: existingForProgram.id });
    if (ce) return setErr(ce.message);
    navigate("/household/checkout");
  };

  const step = existingForProgram ? 3 : 2;
  const progLabel = PROGRAM_LABEL[data?.programs.find((p) => p.id === programId)?.type ?? ""] ?? "";
  const stageLabel = [division ? division.display_label ?? division.name : null, progLabel || null, s ? `${s.year}` : null].filter(Boolean).join(" · ") || "Registration";
  const saveLabel = saving ? "Saving" : win === "before" ? `Opens ${longDate(s?.registration_opens_on ?? null)}` : existingForProgram ? "Update draft" : "Save draft registration";

  const action = step === 2
    ? { label: saveLabel, onClick: save, disabled: !canSave || saving }
    : nextForm
      ? { label: `Sign the ${nextForm.title}`, onClick: nextForm.open, disabled: false }
      : formsReady
        ? { label: "Go to payment", onClick: goPay, disabled: false }
        : { label: "Loading forms", onClick: () => {}, disabled: true };

  const kids = family.data?.children ?? [];
  const household = family.data?.household ?? null;
  const sectionTitle = "mb-3 font-label text-[17px] font-semibold";

  return (
    <AppShell area="family" label={stageLabel} title={name} titleClassName="md:sr-only"
      headerExtra={data?.player ? <BuilderHeaderExtra step={step} /> : undefined}>
      {isLoading ? (
        <div className="mx-auto w-full max-w-2xl px-4 py-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>
      ) : error || !data?.player ? (
        <div className="mx-auto w-full max-w-2xl px-4 py-8">
          <div className="tex-mesh rounded-xl border border-border bg-card p-5">
            <p className="font-label text-[17px] font-semibold">We couldn't find this player in your household.</p>
            <Link to="/household" className="mt-3 inline-flex h-11 items-center underline">Back to Household</Link>
          </div>
        </div>
      ) : (
        <BuilderLayout
          stage={<BuilderStage label={stageLabel} name={name} step={step} />}
          actionBar={
            <BuilderActionBar step={step} label={action.label} onClick={action.onClick} disabled={action.disabled}
              aside={existingForProgram ? <StatusChip tone="neutral">{existingForProgram.lifecycle === "draft" ? "Draft saved" : "Submitted"}</StatusChip> : undefined} />
          }
        >
          <div className="space-y-8">
            <section aria-label="Player">
              <p className={sectionTitle}>Player</p>
              <PlayerPicker
                players={kids.length ? kids.map((c) => ({ id: c.id, initials: c.initials, name: c.display_name })) : [{ id: data.player.id, initials: name.charAt(0).toUpperCase(), name }]}
                selectedId={data.player.id}
                onSelect={(id) => id !== playerId && navigate(`/household/register/${id}`)}
                onAdd={household ? () => setAdding(true) : undefined}
              />
            </section>
            {win === "before" && (
              <div className="tex-mesh rounded-xl border border-border bg-card p-5">
                <p className="font-display text-2xl font-bold">Registration opens {longDate(s?.registration_opens_on ?? null)}</p>
                <p className="mt-1 text-[15px] text-muted-foreground">
                  You can look at programs and divisions now. Saving opens on {longDate(s?.registration_opens_on ?? null)} and closes {longDate(s?.registration_closes_on ?? null)}.
                </p>
              </div>
            )}
            {win === "closed" && (
              <div className="tex-mesh rounded-xl border border-border bg-card p-5">
                <p className="font-display text-2xl font-bold">Registration is closed for this season</p>
              </div>
            )}
            {win === "late" && (
              <p className="text-[15px] text-muted-foreground">Late registration is open until {longDate(s?.late_registration_until ?? null)}. A late fee applies.</p>
            )}
            {win === "test" && <StatusChip tone="warning">Test mode</StatusChip>}

            <section aria-label="Program">
              <p className={sectionTitle}>Program</p>
              <div className="flex flex-wrap gap-2">
                {data.programs.map((p) => {
                  const on = p.id === programId;
                  return (
                    <button key={p.id} type="button" aria-pressed={on} onClick={() => setProgramId(p.id)}
                      className={cn("min-h-[44px] rounded-full border px-5 font-label text-[15px] font-semibold",
                        on ? "is-selected border-primary bg-primary text-primary-foreground" : "tex-mesh border-border bg-card text-foreground")}>
                      {PROGRAM_LABEL[p.type] ?? p.name}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Travel tryouts sign up on the Travel page.</p>
            </section>

            <section aria-label="School grade">
              <label htmlFor="grade" className="mb-2 block font-label text-[17px] font-semibold">
                {name}'s grade in school this year
              </label>
              <select id="grade" value={grade ?? ""} onChange={(e) => setGrade(e.target.value === "" ? null : Number(e.target.value))}
                className="flex h-11 w-full max-w-xs rounded-md border border-input bg-background px-3 text-base">
                <option value="">Choose a grade</option>
                {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </section>

            {grade !== null && elig && !elig.error && (
              <section aria-label="Division" className="space-y-4">
                {elig.conflict && (
                  <div className="rounded-xl border-2 border-warning bg-card p-5" role="group" aria-label="Division check">
                    <p className="font-label text-[17px] font-semibold">Grade and age don't match</p>
                    <p className="mt-1 text-[15px]">{conflictText()}</p>
                    <div className="mt-4 space-y-2">
                      {([
                        elig.grade_division_id && { v: "grade", t: `Use the grade division: ${divName(elig.grade_division_id)}` },
                        elig.age_division_id && { v: "age", t: `Use the age division: ${divName(elig.age_division_id)}` },
                        { v: "review", t: "I'm not sure, have someone review this" },
                      ].filter(Boolean) as { v: Choice; t: string }[]).map((o) => (
                        <label key={o.v} className={cn("flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border px-4 py-2 text-[15px]",
                          choice === o.v ? "is-selected border-primary bg-primary text-primary-foreground" : "border-border")}>
                          <input type="radio" name="choice" className="h-4 w-4" checked={choice === o.v} onChange={() => setChoice(o.v)} />
                          {o.t}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {division && (
                  <div className="tex-mesh rounded-xl border border-border bg-card p-5">
                    <p className="font-label text-sm font-semibold text-muted-foreground">
                      {choice === "review" ? "Held for now, the registrar will confirm" : "Division"}
                    </p>
                    <p className="mt-1 font-display text-3xl font-bold leading-tight">{division.display_label ?? division.name}</p>
                    {division.description && <p className="mt-1 text-[15px]">{division.description}</p>}
                    <p className="mt-2 text-sm text-muted-foreground">
                      {[division.typical_ages, division.cost != null ? `$${Number(division.cost).toFixed(0)}` : null].filter(Boolean).join(", ")}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">The league places players by the rules for each division; you don't choose it.</p>
                  </div>
                )}
              </section>
            )}
            {existingForProgram && (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={async () => {
                    const { error: ce } = await supabase.rpc("add_to_my_cart", { _registration_id: existingForProgram.id });
                    if (ce) return setErr(ce.message);
                    navigate("/household/checkout");
                  }}
                  className="h-11 rounded-full border border-border px-5 font-label text-[15px] font-semibold">
                  Add to checkout
                </button>
                <button type="button" onClick={save} disabled={!canSave || saving}
                  className="h-11 rounded-full border border-border px-5 font-label text-[15px] font-semibold disabled:opacity-50">
                  {saveLabel}
                </button>
              </div>
            )}
            {existingForProgram && (
              <RegistrationForms registrationId={existingForProgram.id} childName={name} onNext={(n, r) => { setNextForm(n); setFormsReady(r); }} />
            )}
            {elig?.error && <p className="text-[15px]">{elig.error}</p>}
            {err && <p role="alert" className="text-sm font-semibold text-destructive">{err}</p>}
          </div>
        </BuilderLayout>
      )}
      {household && (
        <AddPlayerSheet householdId={household.id} open={adding} onOpenChange={setAdding} onSaved={() => family.refetch()} />
      )}
    </AppShell>
  );
};

export default HouseholdRegister;
