import { AppShell } from "@/components/shell/AppShell";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { LogOut, Phone, Mail } from "lucide-react";
import {
  SectionLabel,
  GroupedCard,
  ListRow,
  StatusChip,
  EmptyStateBlock,
  PlayerPicker,
} from "@/components/family";
import type { ChipTone } from "@/components/family/StatusChip";
import HouseholdEditSheet from "@/components/family/HouseholdEditSheet";
import AddPlayerSheet from "@/components/family/AddPlayerSheet";
import { useHouseholdOverview } from "@/hooks/useHouseholdOverview";

const formatTime = (t: string | null) => {
  if (!t) return null;
  const [h, m] = t.split(":");
  let hour = parseInt(h, 10);
  const ap = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ap}`;
};

const dayWord = (dateStr: string) => {
  const d = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
};

const Household = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useHouseholdOverview();
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/login");
  };

  if (error && (error as Error).message === "Not signed in") {
    return <Navigate to="/login?next=/household" replace />;
  }
  if (data?.needsHousehold) return <Navigate to="/household/new" replace />;

  const household = data?.household;
  const you = data?.guardians.find((g) => g.is_you);
  const greetingName = you?.first_name ?? "there";

  const children = data?.children ?? [];
  const selected = children.find((c) => c.id === selectedId) ?? children[0] ?? null;

  // To-dos come only from data this page already loads.
  type Todo = { key: string; task: string; why: string; chip: string; tone: ChipTone; action?: { label: string; onClick?: () => void; to?: string } };
  const todos: Todo[] = [];
  if (data && children.length === 0) {
    todos.push({ key: "link", task: "Add your players", why: "Each child you add here can be registered for the season.", chip: "Due", tone: "warning", action: { label: "Add a player", onClick: () => setAdding(true) } });
  }
  if (household && !household.address_line1) {
    todos.push({ key: "address", task: "Add your address", why: "Mailings and field directions need a home address.", chip: "Due", tone: "warning", action: { label: "Add address", onClick: () => setEditing(true) } });
  }
  [...children]
    .filter((c) => !c.team_name)
    .sort((a, b) => (b.age ?? 0) - (a.age ?? 0))
    .forEach((c) =>
      todos.push({ key: `team-${c.id}`, task: `Waiting for ${c.display_name}'s team`, why: "The league places players on teams; schedule and coach details follow.", chip: "Pending", tone: "neutral" }),
    );
  const [top, ...rest] = todos;
  const words = ["ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
  const headline = todos.length > 0
    ? `${words[todos.length] ?? todos.length} ${todos.length === 1 ? "THING" : "THINGS"} TO DO`
    : children.length > 0
      ? "YOU'RE ALL SET"
      : `HI, ${greetingName.toUpperCase()}`;

  const steps = selected
    ? [
        { n: 1, name: "Player info", chip: selected.date_of_birth ? "Done" : "Not yet", tone: (selected.date_of_birth ? "success" : "neutral") as ChipTone },
        { n: 2, name: "Program", chip: selected.team_name ? "Placed" : "Not yet", tone: (selected.team_name ? "success" : "neutral") as ChipTone, sub: selected.team_name },
        { n: 3, name: "Forms", chip: "Not tracked yet", tone: "neutral" as ChipTone },
        { n: 4, name: "Pay", chip: "Not tracked yet", tone: "neutral" as ChipTone },
      ]
    : [];

  const actionBtn = (a: NonNullable<Todo["action"]>, flood: boolean) => {
    const cls = flood
      ? "inline-flex h-11 items-center rounded-full bg-white px-5 font-label text-[15px] font-semibold text-[#003DA5]"
      : "inline-flex h-11 items-center rounded-full bg-primary px-5 font-label text-[15px] font-semibold text-primary-foreground";
    return a.to ? (
      <Link to={a.to} className={cls}>{a.label}</Link>
    ) : (
      <button type="button" onClick={a.onClick} className={cls}>{a.label}</button>
    );
  };

  return (
    <AppShell area="auto" label="2027 season, In-House" title={isLoading || error ? "Household" : headline}>
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-56 w-full rounded-2xl" />
          </div>
        ) : error ? (
          <GroupedCard>
            <h1 className="font-heading text-xl font-bold">We couldn't load your household</h1>
            <p className="mt-1 text-sm text-muted-foreground">{(error as Error).message}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button className="h-11 rounded-xl" onClick={() => refetch()}>
                Try again
              </Button>
              <Button variant="outline" className="h-11 rounded-xl" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </div>
          </GroupedCard>
        ) : (
          <div className="space-y-8">
            {top && (
              <div className="card-flood rounded-xl border p-5">
                <p className="font-label text-xs font-semibold tracking-[0.12em]">MOST IMPORTANT</p>
                <p className="mt-2 font-display text-2xl font-bold leading-tight">{top.task}</p>
                <p className="mt-1 text-[15px] text-white/90">{top.why}</p>
                {top.action && <div className="mt-4">{actionBtn(top.action, true)}</div>}
              </div>
            )}
            {rest.length > 0 && (
              <ul className="space-y-3" role="list">
                {rest.map((t) => (
                  <li key={t.key} className="tex-mesh rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-label text-[17px] font-semibold">{t.task}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{t.why}</p>
                      </div>
                      <StatusChip tone={t.tone}>{t.chip}</StatusChip>
                    </div>
                    {t.action && <div className="mt-3">{actionBtn(t.action, false)}</div>}
                  </li>
                ))}
              </ul>
            )}

            <section aria-label="Players">
              <SectionLabel>Players</SectionLabel>
              <PlayerPicker
                players={children.map((c) => ({ id: c.id, initials: c.initials, name: c.display_name }))}
                selectedId={selected?.id ?? null}
                onSelect={setSelectedId}
                onAdd={household ? () => setAdding(true) : undefined}
              />
              {selected && (
                <ol className="tex-mesh mt-4 divide-y divide-border rounded-xl border border-border bg-card">
                  {steps.map((st) => (
                    <li key={st.n} className="flex min-h-[52px] items-center justify-between gap-3 px-4 py-3">
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="w-5 shrink-0 font-display text-lg font-bold text-muted-foreground">{st.n}</span>
                        <span className="min-w-0">
                          <span className="block font-label text-[16px] font-semibold">{st.name}</span>
                          {st.sub && <span className="block truncate text-sm text-muted-foreground">{st.sub}</span>}
                        </span>
                      </span>
                      <StatusChip tone={st.tone}>{st.chip}</StatusChip>
                    </li>
                  ))}
                </ol>
              )}
              {selected && (
                <Link to={`/household/register/${selected.id}`} className="mt-3 inline-flex h-11 items-center rounded-full bg-primary px-5 font-label text-[15px] font-semibold text-primary-foreground">
                  Choose a program for {selected.display_name}
                </Link>
              )}
            </section>

            {data?.nextEvent && (
              <div className="tex-mesh rounded-xl border border-border bg-card p-5">
                <p className="font-label text-sm font-semibold text-muted-foreground">
                  {data.nextEvent.childName ? `${data.nextEvent.childName}'s next event` : "Next up"}
                </p>
                <p className="mt-1 font-display text-2xl font-bold leading-tight">
                  {data.nextEvent.all_day ? dayWord(data.nextEvent.start_date) : formatTime(data.nextEvent.start_time) ?? dayWord(data.nextEvent.start_date)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {dayWord(data.nextEvent.start_date)}, {data.nextEvent.title}
                </p>
                {(data.nextEvent.facility_site || data.nextEvent.location) && (
                  <p className="mt-2 text-sm">
                    {data.nextEvent.facility_site ?? data.nextEvent.location}
                    {data.nextEvent.facility_field ? `, ${data.nextEvent.facility_field}` : ""}
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div className="space-y-8">
            {/* Your family */}
            <section id="family" className="scroll-mt-4">
              <SectionLabel>Your family</SectionLabel>
              <GroupedCard flush>
                {data && data.children.length > 0 ? (
                  data.children.map((c) => (
                    <ListRow
                      key={c.id}
                      initials={c.initials}
                      title={c.full_name}
                      subtitle={c.age !== null ? `${c.age} years old` : null}
                      trailing={
                        c.team_name ? (
                          <StatusChip tone="brand">{c.team_name}</StatusChip>
                        ) : (
                          <StatusChip>No team yet</StatusChip>
                        )
                      }
                    />
                  ))
                ) : (
                  <div className="p-4">
                    <EmptyStateBlock>
                      No players are linked yet; they appear here once a registration is processed.
                    </EmptyStateBlock>
                  </div>
                )}
              </GroupedCard>
            </section>

            {/* Guardians */}
            <section id="guardians" className="scroll-mt-4">
              <SectionLabel>Guardians</SectionLabel>
              <GroupedCard flush>
                {data?.guardians.map((g) => (
                  <ListRow
                    key={g.id}
                    initials={`${(g.first_name ?? "").charAt(0)}${(g.last_name ?? "").charAt(0)}`}
                    title={`${g.first_name ?? ""} ${g.last_name ?? ""}`.trim() || (g.email ?? "Guardian")}
                    subtitle={[
                      g.is_you ? "You" : null,
                      g.is_primary ? "Primary guardian" : "Guardian",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                ))}
              </GroupedCard>
              <div className="px-1 pt-3">
                <Button
                  variant="outline"
                  disabled
                  className="h-11 w-full rounded-xl sm:w-auto"
                >
                  Invite a guardian · Coming soon
                </Button>
              </div>
            </section>
            </div>
            <div className="space-y-8">
            {/* Per-child team + coach */}
            {data?.children.map((c, ci) => (
              <section id={ci === 0 ? "team" : undefined} className="scroll-mt-4" key={`team-${c.id}`}>
                <SectionLabel>{c.display_name}'s team</SectionLabel>
                <GroupedCard flush>
                  {c.team_name ? (
                    <>
                      <ListRow
                        title={c.team_name}
                        subtitle={c.jersey_number ? `Jersey #${c.jersey_number}` : null}
                      />
                      {c.coaches.length > 0 ? (
                        c.coaches.map((coach, i) => (
                          <ListRow
                            key={`${c.id}-coach-${i}`}
                            initials={(coach.name ?? "?").charAt(0)}
                            title={coach.name ?? "Coach"}
                            subtitle={coach.role ?? "Coach"}
                            trailing={
                              <span className="flex items-center gap-1.5">
                                {coach.phone && (
                                  <a
                                    href={`tel:${coach.phone}`}
                                    aria-label={`Call ${coach.name}`}
                                    className="flex h-11 w-11 items-center justify-center rounded-full text-primary"
                                  >
                                    <Phone className="h-4 w-4" />
                                  </a>
                                )}
                                {coach.email && (
                                  <a
                                    href={`mailto:${coach.email}`}
                                    aria-label={`Email ${coach.name}`}
                                    className="flex h-11 w-11 items-center justify-center rounded-full text-primary"
                                  >
                                    <Mail className="h-4 w-4" />
                                  </a>
                                )}
                              </span>
                            }
                          />
                        ))
                      ) : (
                        <div className="p-4">
                          <EmptyStateBlock>
                            Coach contact details will appear here once staff are confirmed for{" "}
                            {c.team_name}.
                          </EmptyStateBlock>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4">
                      <EmptyStateBlock>
                        When {c.display_name} is placed on a team, his schedule, coach contact,
                        and development updates will appear here.
                      </EmptyStateBlock>
                    </div>
                  )}
                </GroupedCard>
              </section>
            ))}

            {/* Schedule */}
            <section id="upcoming" className="scroll-mt-4">
              <SectionLabel>Upcoming</SectionLabel>
              <GroupedCard flush>
                {data && data.children.some((c) => c.next_events.length > 0) ? (
                  data.children.flatMap((c) =>
                    c.next_events.map((e) => (
                      <ListRow
                        key={e.id}
                       
                        title={e.title}
                        subtitle={`${dayWord(e.start_date)}${
                          e.all_day ? "" : ` · ${formatTime(e.start_time) ?? ""}`
                        }${e.facility_site ? ` · ${e.facility_site}` : ""}`}
                        trailing={<StatusChip>{c.display_name}</StatusChip>}
                      />
                    )),
                  )
                ) : (
                  <div className="p-4">
                    <EmptyStateBlock>
                      No games or practices are scheduled for your players yet.
                    </EmptyStateBlock>
                  </div>
                )}
              </GroupedCard>
            </section>
            </div>
            </div>

          </div>
        )}
      </div>

      {household && (
        <HouseholdEditSheet
          household={household}
          open={editing}
          onOpenChange={setEditing}
          onSaved={() => refetch()}
        />
      )}
      {household && (
        <AddPlayerSheet
          householdId={household.id}
          open={adding}
          onOpenChange={setAdding}
          onSaved={() => refetch()}
        />
      )}
    </AppShell>
  );
};

export default Household;
