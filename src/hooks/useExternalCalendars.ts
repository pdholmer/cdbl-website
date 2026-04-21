import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExternalCalendar {
  id: string;
  name: string;
  ical_url: string;
  source: string;
  color: string | null;
  is_active: boolean;
  last_synced_at: string | null;
  last_sync_status: string | null;
  last_sync_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExternalCalendarEvent {
  id: string;
  calendar_id: string;
  external_uid: string;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  all_day: boolean;
  event_category: "game" | "practice" | "event" | null;
  program_id: string | null;
  division_id: string | null;
  home_team_id: string | null;
  away_team_id: string | null;
  field_number: string | null;
  calendar?: { name: string; color: string | null };
}

export const useExternalCalendars = () => {
  return useQuery({
    queryKey: ["external-calendars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("external_calendars" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ExternalCalendar[];
    },
  });
};

export const useExternalCalendarEvents = () => {
  return useQuery({
    queryKey: ["external-calendar-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("external_calendar_events" as any)
        .select(
          "id, calendar_id, external_uid, title, description, location, start_date, start_time, end_date, end_time, all_day, event_category, program_id, division_id, home_team_id, away_team_id, field_number, calendar:external_calendars(name, color, is_active)",
        )
        .order("start_date", { ascending: true });
      if (error) throw error;
      const filtered = ((data ?? []) as any[]).filter(
        (e) => e.calendar?.is_active !== false,
      );
      return filtered as unknown as ExternalCalendarEvent[];
    },
  });
};

export const useSyncExternalCalendar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (calendarId?: string) => {
      const { data, error } = await supabase.functions.invoke(
        "sync-external-calendar",
        { body: calendarId ? { calendar_id: calendarId } : {} },
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      const results = data?.results ?? [];
      const ok = results.filter((r: any) => r.status === "success");
      const errs = results.filter((r: any) => r.status === "error");
      if (errs.length) {
        toast.error(`Sync had errors: ${errs[0].error ?? "unknown"}`);
      } else {
        const total = ok.reduce((s: number, r: any) => s + (r.synced ?? 0), 0);
        toast.success(`Synced ${total} event(s)`);
      }
      qc.invalidateQueries({ queryKey: ["external-calendars"] });
      qc.invalidateQueries({ queryKey: ["external-calendar-events"] });
    },
    onError: (err: any) => {
      toast.error(`Sync failed: ${err?.message ?? "unknown error"}`);
    },
  });
};

export const useExternalCalendarMutations = () => {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["external-calendars"] });
    qc.invalidateQueries({ queryKey: ["external-calendar-events"] });
  };
  return {
    create: useMutation({
      mutationFn: async (input: {
        name: string;
        ical_url: string;
        color?: string;
        source?: string;
      }) => {
        const { data, error } = await supabase
          .from("external_calendars" as any)
          .insert({
            name: input.name,
            ical_url: input.ical_url,
            color: input.color ?? "#8b5cf6",
            source: input.source ?? "ical",
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      },
      onSuccess: () => {
        toast.success("Calendar added");
        invalidate();
      },
      onError: (e: any) => toast.error(e?.message ?? "Failed to add"),
    }),
    update: useMutation({
      mutationFn: async ({
        id,
        updates,
      }: {
        id: string;
        updates: Partial<ExternalCalendar>;
      }) => {
        const { error } = await supabase
          .from("external_calendars" as any)
          .update(updates)
          .eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => invalidate(),
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase
          .from("external_calendars" as any)
          .delete()
          .eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => {
        toast.success("Calendar removed");
        invalidate();
      },
    }),
  };
};
