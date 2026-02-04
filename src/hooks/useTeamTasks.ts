import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TeamTask {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  task_type: "task" | "milestone";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  completed_at: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  coach?: {
    first_name: string;
    last_name: string;
  } | null;
}

export interface TeamImportantDate {
  id: string;
  team_id: string;
  title: string;
  date_value: string;
  date_type: "practice_start" | "season_start" | "season_end" | "tournament" | "tryout" | "other";
  description: string | null;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export const useTeamTasks = (teamId: string | undefined) => {
  return useQuery({
    queryKey: ["team-tasks", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      const { data, error } = await supabase
        .from("team_tasks")
        .select(`
          *,
          coach:coaches!team_tasks_assigned_to_fkey(first_name, last_name)
        `)
        .eq("team_id", teamId)
        .order("due_date", { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data as TeamTask[];
    },
    enabled: !!teamId,
  });
};

export const useTeamImportantDates = (teamId: string | undefined) => {
  return useQuery({
    queryKey: ["team-important-dates", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      const { data, error } = await supabase
        .from("team_important_dates")
        .select("*")
        .eq("team_id", teamId)
        .order("date_value", { ascending: true });

      if (error) throw error;
      return data as TeamImportantDate[];
    },
    enabled: !!teamId,
  });
};

export const useTeamTaskMutations = () => {
  const queryClient = useQueryClient();

  const createTask = useMutation({
    mutationFn: async (task: Omit<TeamTask, "id" | "created_at" | "updated_at" | "coach">) => {
      const { data, error } = await supabase.from("team_tasks").insert(task).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team-tasks", variables.team_id] });
      toast.success("Task created");
    },
    onError: () => toast.error("Failed to create task"),
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, teamId, ...updates }: { id: string; teamId: string } & Partial<TeamTask>) => {
      const { data, error } = await supabase.from("team_tasks").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team-tasks", variables.teamId] });
      toast.success("Task updated");
    },
    onError: () => toast.error("Failed to update task"),
  });

  const deleteTask = useMutation({
    mutationFn: async ({ id, teamId }: { id: string; teamId: string }) => {
      const { error } = await supabase.from("team_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team-tasks", variables.teamId] });
      toast.success("Task deleted");
    },
    onError: () => toast.error("Failed to delete task"),
  });

  return { createTask, updateTask, deleteTask };
};

export const useTeamDateMutations = () => {
  const queryClient = useQueryClient();

  const createDate = useMutation({
    mutationFn: async (date: Omit<TeamImportantDate, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("team_important_dates").insert(date).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team-important-dates", variables.team_id] });
      toast.success("Date added");
    },
    onError: () => toast.error("Failed to add date"),
  });

  const deleteDate = useMutation({
    mutationFn: async ({ id, teamId }: { id: string; teamId: string }) => {
      const { error } = await supabase.from("team_important_dates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team-important-dates", variables.teamId] });
      toast.success("Date removed");
    },
    onError: () => toast.error("Failed to remove date"),
  });

  return { createDate, deleteDate };
};
