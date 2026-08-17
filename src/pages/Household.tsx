import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { LogOut, MapPin, Pencil, Phone, Mail, CalendarDays, Shield } from "lucide-react";
import {
  SectionLabel,
  GroupedCard,
  ListRow,
  StatusChip,
  EmptyStateBlock,
  FamilyHeader,
} from "@/components/family";
import HouseholdEditSheet from "@/components/family/HouseholdEditSheet";
import { useHouseholdOverview, type FamilyEvent } from "@/hooks/useHouseholdOverview";

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

  const renderEvent = (e: FamilyEvent & { childName?: string }) => (
    <div className="rounded-2xl bg-[linear-gradient(150deg,hsl(var(--primary))_0%,hsl(217_100%_24%)_100%)] p-5 text-primary-foreground shadow-[0_14px_36px_-16px_hsl(var(--primary)/0.75)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/70">
        {e.childName ? `${e.childName}'s next event` : "Next up"}
      </p>
      <p className="mt-2 font-heading text-3xl font-bold leading-tight">
        {e.all_day ? dayWord(e.start_date) : formatTime(e.start_time) ?? dayWord(e.start_date)}
      </p>
      <p className="text-sm text-primary-foreground/85">
        {dayWord(e.start_date)} · {e.title}
      </p>
      {(e.facility_site || e.location) && (
        <div className="mt-4 space-y-1 rounded-xl bg-white/10 p-3 text-sm">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            {e.facility_site ?? e.location}
          </p>
          {e.facility_field && (
            <p className="pl-6 text-primary-foreground/80">{e.facility_field}</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[hsl(217_30%_97%)] pb-16">
      <FamilyHeader context="Household" />
      <div className="mx-auto w-full max-w-[640px] px-4 pt-8 sm:px-6 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
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
            <header>
              <h1 className="font-heading text-[34px] font-bold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[44px]">
                Hi, {greetingName}
              </h1>
              <p className="mt-1 text-[15px] text-muted-foreground">
                {household?.name ?? "Your household"}
              </p>
            </header>

            {/* Hero: next event when one exists, otherwise the household card */}
            {data?.nextEvent ? (
              renderEvent(data.nextEvent)
            ) : (
              <div className="rounded-2xl bg-[linear-gradient(150deg,hsl(217_100%_26%)_0%,hsl(217_100%_32%)_100%)] p-5 text-primary-foreground shadow-[0_14px_36px_-16px_hsl(var(--primary)/0.75)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-heading text-xl font-bold">{household?.name}</h2>
                    {household?.address_line1 ? (
                      <p className="mt-1 text-sm leading-relaxed text-primary-foreground/85">
                        {household.address_line1}
                        {household.address_line2 ? `, ${household.address_line2}` : ""}
                        <br />
                        {[household.city, household.state].filter(Boolean).join(", ")}{" "}
                        {household.zip_code}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm leading-relaxed text-primary-foreground/85">
                        Add your address so mailings and field directions reach you.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="flex h-11 shrink-0 items-center rounded-full border border-primary-foreground/60 px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </button>
                </div>
              </div>
            )}

            {/* Your family */}
            <section>
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
                      No players are linked to this household yet. Once a registration is
                      processed, your child will show up here.
                    </EmptyStateBlock>
                  </div>
                )}
              </GroupedCard>
            </section>

            {/* Per-child team + coach */}
            {data?.children.map((c) => (
              <section key={`team-${c.id}`}>
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
                      <EmptyStateBlock icon={<Shield className="h-5 w-5" />}>
                        When {c.display_name} is placed on a team, his schedule, coach contact,
                        and development updates will appear here.
                      </EmptyStateBlock>
                    </div>
                  )}
                </GroupedCard>
              </section>
            ))}

            {/* Schedule */}
            <section>
              <SectionLabel>Upcoming</SectionLabel>
              <GroupedCard flush>
                {data && data.children.some((c) => c.next_events.length > 0) ? (
                  data.children.flatMap((c) =>
                    c.next_events.map((e) => (
                      <ListRow
                        key={e.id}
                        icon={<CalendarDays className="h-5 w-5" />}
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
                    <EmptyStateBlock icon={<CalendarDays className="h-5 w-5" />}>
                      No upcoming events yet — the 2027 season is coming.
                    </EmptyStateBlock>
                  </div>
                )}
              </GroupedCard>
            </section>

            {/* Guardians */}
            <section>
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
    </div>
  );
};

export default Household;
