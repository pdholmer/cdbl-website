import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusChip } from "@/components/family";
import { gradeRangeLabel, longDate } from "@/lib/registration";
import { useMyRoles } from "@/lib/adminAccess";
import { toast } from "sonner";
import FormVersions from "@/components/admin/FormVersions";
import MoneySetup from "@/components/admin/MoneySetup";
import PaymentsDesk from "@/components/admin/PaymentsDesk";

/** Registration setup: working values to confirm, open-gate issues, and placement reviews. */
const RegistrationSetup = () => {
  const qc = useQueryClient();
  const roles = useMyRoles() ?? [];
  const isAdmin = roles.includes("admin");

  const { data, isLoading, error } = useQuery({
    queryKey: ["registration-setup"],
    queryFn: async () => {
      const { data: season, error: se } = await supabase.from("seasons").select("*")
        .not("registration_opens_on", "is", null).order("year", { ascending: false }).limit(1).maybeSingle();
      if (se) throw se;
      const { data: programs, error: pe } = await supabase.from("programs").select("id, name, type")
        .eq("season_id", season?.id ?? "").in("type", ["in_house", "ihtt", "clinic"]);
      if (pe) throw pe;
      const ids = (programs ?? []).map((p) => p.id);
      const { data: divisions, error: de } = await supabase.from("divisions")
        .select("id, program_id, name, eligibility_mode, min_grade, max_grade, min_age, max_age, cost, eligibility_confirmed_at, cost_confirmed_at, display_order")
        .in("program_id", ids.length ? ids : [""]).order("display_order");
      if (de) throw de;
      const issues: Record<string, string[]> = {};
      for (const id of ids) {
        const { data: r } = await supabase.rpc("program_open_issues", { _program_id: id });
        issues[id] = (r as unknown as string[]) ?? [];
      }
      const { data: reviews, error: re } = await supabase.from("placement_reviews")
        .select("id, registration_id, player_id, league_age, grade, grade_division_id, age_division_id, reason, created_at")
        .eq("status", "open").order("created_at");
      if (re) throw re;
      const pids = (reviews ?? []).map((r) => r.player_id);
      const { data: players } = pids.length
        ? await supabase.from("players").select("id, first_name, last_name").in("id", pids)
        : { data: [] as { id: string; first_name: string; last_name: string }[] };
      return { season, programs: programs ?? [], divisions: divisions ?? [], issues, reviews: reviews ?? [], players: players ?? [] };
    },
  });

  const [cutoff, setCutoff] = useState("");
  const [schoolStart, setSchoolStart] = useState("");
  const [impact, setImpact] = useState<number | null>(null);
  const reload = () => qc.invalidateQueries({ queryKey: ["registration-setup"] });
  const s = data?.season;
  const divName = (id: string | null) => data?.divisions.find((d) => d.id === id)?.name ?? "None";

  const checkImpact = async () => {
    if (!s) return;
    const { data: n, error: e } = await supabase.rpc("season_date_change_impact", { _season_id: s.id, _new_cutoff: cutoff || s.age_cutoff_date! });
    if (e) return toast.error(e.message);
    setImpact(n as number);
  };
  const applyDates = async () => {
    if (!s || impact === null) return;
    const { error: e } = await supabase.rpc("change_season_dates", {
      _season_id: s.id, _cutoff: cutoff || s.age_cutoff_date!, _school_year_start: schoolStart || s.school_year_start!, _acknowledged_moves: impact,
    });
    if (e) return toast.error(e.message);
    toast.success("Season dates changed"); setImpact(null); setCutoff(""); setSchoolStart(""); reload();
  };
  const confirmSeason = async () => {
    const { error: e } = await supabase.from("seasons").update({ dates_confirmed_at: new Date().toISOString() }).eq("id", s!.id);
    if (e) return toast.error(e.message); reload();
  };
  const setTestMode = async (on: boolean) => {
    const { error: e } = await supabase.from("seasons").update({ registration_test_mode: on }).eq("id", s!.id);
    if (e) return toast.error(e.message); reload();
  };
  const confirmDivision = async (id: string, field: "eligibility_confirmed_at" | "cost_confirmed_at") => {
    const { error: e } = await supabase.from("divisions").update({ [field]: new Date().toISOString() }).eq("id", id);
    if (e) return toast.error(e.message); reload();
  };
  const resolve = async (reviewId: string, registrationId: string, divisionId: string | null) => {
    if (!divisionId) return;
    const { data: u } = await supabase.auth.getUser();
    const { error: e1 } = await supabase.from("registrations").update({ division_id: divisionId, hold_reason: null }).eq("id", registrationId);
    if (e1) return toast.error(e1.message);
    const { error: e2 } = await supabase.from("placement_reviews").update({
      status: "resolved", resolution_division_id: divisionId, resolved_by: u.user?.id, resolved_at: new Date().toISOString(),
    }).eq("id", reviewId);
    if (e2) return toast.error(e2.message);
    toast.success("Placement confirmed"); reload();
  };

  const working = <StatusChip tone="warning">Working value, confirm</StatusChip>;
  const confirmed = <StatusChip tone="success">Confirmed</StatusChip>;

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:px-6">
        <h1 className="font-display text-3xl font-bold">Registration setup</h1>
        {isLoading ? <Skeleton className="h-64 w-full rounded-2xl" /> : error || !s ? (
          <p>We couldn't load the season. {(error as Error | null)?.message}</p>
        ) : (
          <>
            <section className="tex-mesh space-y-4 rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-label text-[17px] font-semibold">{s.year} season</p>
                {s.dates_confirmed_at ? confirmed : working}
              </div>
              <dl className="grid gap-3 text-[15px] sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Age cutoff date</dt><dd>{longDate(s.age_cutoff_date)}, {s.age_cutoff_date?.slice(0, 4)}</dd></div>
                <div><dt className="text-muted-foreground">School year starts</dt><dd>{longDate(s.school_year_start)}, {s.school_year_start?.slice(0, 4)}</dd></div>
                <div><dt className="text-muted-foreground">Registration window</dt><dd>{longDate(s.registration_opens_on)} to {longDate(s.registration_closes_on)}, late until {longDate(s.late_registration_until)}</dd></div>
              </dl>
              {isAdmin && !s.dates_confirmed_at && <Button variant="outline" className="h-11 rounded-full" onClick={confirmSeason}>Confirm these dates</Button>}
              <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <div className="space-y-1.5"><Label htmlFor="cut">New age cutoff</Label><Input id="cut" type="date" className="h-11" value={cutoff} onChange={(e) => { setCutoff(e.target.value); setImpact(null); }} /></div>
                <div className="space-y-1.5"><Label htmlFor="sys">New school-year start</Label><Input id="sys" type="date" className="h-11" value={schoolStart} onChange={(e) => { setSchoolStart(e.target.value); setImpact(null); }} /></div>
                <Button variant="outline" className="h-11 rounded-full" disabled={!cutoff && !schoolStart} onClick={checkImpact}>Check impact</Button>
              </div>
              {impact !== null && (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[15px]">This re-buckets {impact} {impact === 1 ? "player" : "players"}.</p>
                  <Button className="h-11 rounded-full" onClick={applyDates}>Change the dates</Button>
                </div>
              )}
              {isAdmin && (
                <label className="flex min-h-[44px] items-center gap-3 border-t border-border pt-4 text-[15px]">
                  <Switch checked={s.registration_test_mode} onCheckedChange={setTestMode} />
                  Test mode: families can save drafts before the open date. Turn off before going live.
                </label>
              )}
            </section>

            {data.programs.map((p) => (
              <section key={p.id} className="space-y-3">
                <p className="font-label text-[17px] font-semibold">{p.name}</p>
                {data.issues[p.id]?.length ? (
                  <ul className="space-y-1 text-[15px]">
                    {data.issues[p.id].map((i) => <li key={i} className="text-destructive">Cannot open yet: {i}</li>)}
                  </ul>
                ) : <p className="text-sm text-muted-foreground">Ready to open: fees and ranges check out.</p>}
                <div className="tex-mesh overflow-x-auto rounded-xl border border-border bg-card">
                  <table className="w-full min-w-[620px] text-[15px]">
                    <thead><tr className="text-left text-muted-foreground"><th className="p-3">Division</th><th className="p-3">Placed by</th><th className="p-3">Grades</th><th className="p-3">League ages</th><th className="p-3">Fee</th><th className="p-3">Status</th></tr></thead>
                    <tbody className="divide-y divide-border">
                      {data.divisions.filter((d) => d.program_id === p.id).map((d) => (
                        <tr key={d.id}>
                          <td className="p-3 font-semibold">{d.name}</td>
                          <td className="p-3">{d.eligibility_mode === "dob" ? "Age" : d.eligibility_mode === "grade" ? "Grade" : "Either"}</td>
                          <td className="p-3">{gradeRangeLabel(d.min_grade, d.max_grade) || "None"}</td>
                          <td className="p-3">{d.min_age != null ? `${d.min_age} to ${d.max_age}` : "None"}</td>
                          <td className="p-3">{d.cost != null ? `$${Number(d.cost).toFixed(0)}` : "Hidden"}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-2">
                              {d.eligibility_confirmed_at ? confirmed : isAdmin
                                ? <button className="min-h-[44px]" onClick={() => confirmDivision(d.id, "eligibility_confirmed_at")}>{working}</button> : working}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}

            <MoneySetup seasonId={s.id} roles={roles} />
            {roles.some((r) => ["admin", "treasurer", "registrar"].includes(r)) && <PaymentsDesk />}

            <FormVersions isAdmin={isAdmin} />

            <section className="space-y-3" aria-label="Placement reviews">
              <p className="font-label text-[17px] font-semibold">Placement reviews</p>
              {data.reviews.length === 0 ? (
                <p className="text-[15px] text-muted-foreground">No families are waiting on a division decision.</p>
              ) : (
                <ul className="space-y-3">
                  {data.reviews.map((r) => {
                    const pl = data.players.find((x) => x.id === r.player_id);
                    return (
                      <li key={r.id} className="tex-mesh rounded-xl border border-border bg-card p-4">
                        <p className="font-label text-[17px] font-semibold">{pl ? `${pl.first_name} ${pl.last_name}` : "Player"}</p>
                        <p className="text-sm text-muted-foreground">League age {r.league_age ?? "unknown"}, grade {r.grade ?? "unknown"}. Grade says {divName(r.grade_division_id)}, age says {divName(r.age_division_id)}.</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {r.grade_division_id && <Button variant="outline" className="h-11 rounded-full" onClick={() => resolve(r.id, r.registration_id, r.grade_division_id)}>Place in {divName(r.grade_division_id)}</Button>}
                          {r.age_division_id && r.age_division_id !== r.grade_division_id && <Button variant="outline" className="h-11 rounded-full" onClick={() => resolve(r.id, r.registration_id, r.age_division_id)}>Place in {divName(r.age_division_id)}</Button>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default RegistrationSetup;
