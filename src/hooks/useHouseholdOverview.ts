import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateAge } from "@/utils/age";

export interface HouseholdRecord {
  id: string;
  name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
}

export interface HouseholdGuardian {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  relationship: string | null;
  is_primary: boolean;
  is_you: boolean;
}

export interface FamilyCoach {
  name: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
}

export interface FamilyEvent {
  id: string;
  title: string;
  start_date: string;
  start_time: string | null;
  all_day: boolean;
  location: string | null;
  facility_site: string | null;
  facility_field: string | null;
  event_category: string | null;
  team_id: string;
}

export interface FamilyChild {
  id: string;
  first_name: string;
  display_name: string;
  full_name: string;
  date_of_birth: string | null;
  age: number | null;
  initials: string;
  team_id: string | null;
  team_name: string | null;
  jersey_number: string | null;
  coaches: FamilyCoach[];
  next_events: FamilyEvent[];
}

export interface HouseholdOverview {
  household: HouseholdRecord | null;
  guardianId: string | null;
  needsHousehold: boolean;
  guardians: HouseholdGuardian[];
  children: FamilyChild[];
  nextEvent: (FamilyEvent & { childName: string }) | null;
}

const initialsOf = (first?: string | null, last?: string | null) =>
  `${(first ?? "").charAt(0)}${(last ?? "").charAt(0)}`.toUpperCase() || "?";

export const useHouseholdOverview = () => {
  return useQuery<HouseholdOverview>({
    queryKey: ["household-overview"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) throw new Error("Not signed in");

      // 1. Who am I as a guardian?
      const { data: me, error: meError } = await supabase
        .from("guardians")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .maybeSingle();
      if (meError) throw meError;
      if (!me) {
        return {
          household: null,
          guardianId: null,
          needsHousehold: true,
          guardians: [],
          children: [],
          nextEvent: null,
        };
      }

      // 2. My household (composite FK requires the constraint hint).
      const { data: link, error: linkError } = await supabase
        .from("guardian_households")
        .select(
          "household_id, households:households!gh_league_household_fkey(id, name, address_line1, address_line2, city, state, zip_code)",
        )
        .eq("guardian_id", me.id)
        .limit(1)
        .maybeSingle();
      if (linkError) throw linkError;

      const household = ((link as any)?.households ?? null) as HouseholdRecord | null;
      if (!household) {
        return {
          household: null,
          guardianId: me.id,
          needsHousehold: true,
          guardians: [],
          children: [],
          nextEvent: null,
        };
      }

      // 3. Everyone in the household.
      const { data: guardianRows, error: guardiansError } = await supabase
        .from("guardian_households")
        .select(
          "guardian_id, is_primary, guardians:guardians!gh_league_guardian_fkey(id, first_name, last_name, email, phone, relationship)",
        )
        .eq("household_id", household.id)
        .order("is_primary", { ascending: false });
      if (guardiansError) throw guardiansError;

      const guardians: HouseholdGuardian[] = (guardianRows ?? [])
        .filter((row: any) => row.guardians)
        .map((row: any) => ({
          id: row.guardians.id,
          first_name: row.guardians.first_name,
          last_name: row.guardians.last_name,
          email: row.guardians.email,
          phone: row.guardians.phone,
          relationship: row.guardians.relationship,
          is_primary: !!row.is_primary,
          is_you: row.guardians.id === me.id,
        }));

      // 4. Children. household_players -> league_players is a composite FK that
      // guardians cannot read, so resolve player ids first and read players directly.
      const { data: hp, error: hpError } = await supabase
        .from("household_players")
        .select("player_id")
        .eq("household_id", household.id);
      if (hpError) throw hpError;

      const playerIds = (hp ?? []).map((r: any) => r.player_id);
      let children: FamilyChild[] = [];

      if (playerIds.length > 0) {
        const { data: players, error: playersError } = await supabase
          .from("players")
          .select("id, first_name, preferred_name, last_name, date_of_birth")
          .in("id", playerIds);
        if (playersError) throw playersError;

        // 5. Roster + coach contact (guardian-scoped view). Empty until rosters land.
        const { data: roster, error: rosterError } = await supabase
          .from("v_roster_family" as any)
          .select("team_id, team_name, player_id, jersey_number, coach_name, coach_role, coach_email, coach_phone")
          .in("player_id", playerIds);
        if (rosterError) throw rosterError;

        const rosterRows = (roster ?? []) as any[];
        const teamIds = Array.from(
          new Set(rosterRows.map((r) => r.team_id).filter(Boolean)),
        ) as string[];

        // 6. Next scheduled events for those teams.
        let eventRows: any[] = [];
        if (teamIds.length > 0) {
          const today = new Date().toISOString().slice(0, 10);
          const orFilter = `home_team_id.in.(${teamIds.join(",")}),away_team_id.in.(${teamIds.join(",")})`;
          const { data: events, error: eventsError } = await supabase
            .from("external_calendar_events" as any)
            .select(
              "id, title, start_date, start_time, all_day, location, facility_site, facility_field, event_category, home_team_id, away_team_id",
            )
            .eq("status", "active")
            .gte("start_date", today)
            .or(orFilter)
            .order("start_date", { ascending: true })
            .limit(50);
          if (eventsError) throw eventsError;
          eventRows = events ?? [];
        }

        children = (players ?? []).map((p: any) => {
          const rows = rosterRows.filter((r) => r.player_id === p.id);
          const teamId = rows[0]?.team_id ?? null;
          const display = p.preferred_name || p.first_name;
          return {
            id: p.id,
            first_name: p.first_name,
            display_name: display,
            full_name: `${display} ${p.last_name ?? ""}`.trim(),
            date_of_birth: p.date_of_birth,
            age: calculateAge(p.date_of_birth),
            initials: initialsOf(display, p.last_name),
            team_id: teamId,
            team_name: rows[0]?.team_name ?? null,
            jersey_number: rows[0]?.jersey_number ?? null,
            coaches: rows
              .filter((r) => r.coach_name)
              .map((r) => ({
                name: r.coach_name,
                role: r.coach_role,
                email: r.coach_email,
                phone: r.coach_phone,
              })),
            next_events: teamId
              ? eventRows
                  .filter(
                    (e) => e.home_team_id === teamId || e.away_team_id === teamId,
                  )
                  .slice(0, 3)
                  .map((e) => ({
                    id: e.id,
                    title: e.title,
                    start_date: e.start_date,
                    start_time: e.start_time,
                    all_day: !!e.all_day,
                    location: e.location,
                    facility_site: e.facility_site,
                    facility_field: e.facility_field,
                    event_category: e.event_category,
                    team_id: teamId,
                  }))
              : [],
          };
        });
      }

      const upcoming = children
        .flatMap((c) => c.next_events.map((e) => ({ ...e, childName: c.display_name })))
        .sort((a, b) =>
          `${a.start_date}${a.start_time ?? ""}`.localeCompare(
            `${b.start_date}${b.start_time ?? ""}`,
          ),
        );

      return {
        household,
        guardianId: me.id,
        needsHousehold: false,
        guardians,
        children,
        nextEvent: upcoming[0] ?? null,
      };
    },
  });
};
