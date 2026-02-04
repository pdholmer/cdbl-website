import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type CommitteeType = "board" | "fundraising" | "fields" | "concessions" | "equipment" | "events" | "communications" | "safety" | "umpires" | "other";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface CommitteeTask {
  id: string;
  title: string;
  description: string | null;
  committee: CommitteeType;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  assigned_to: string | null;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  assignee?: {
    email: string;
    display_name: string | null;
  } | null;
}

export interface CommitteeTaskFilters {
  committee?: CommitteeType;
  status?: TaskStatus;
  priority?: TaskPriority;
}

export const useCommitteeTasks = (filters?: CommitteeTaskFilters) => {
  return useQuery({
    queryKey: ["committee-tasks", filters],
    queryFn: async () => {
      let query = supabase
        .from("committee_tasks")
        .select("*")
        .order("due_date", { ascending: true, nullsFirst: false });

      if (filters?.committee) {
        query = query.eq("committee", filters.committee);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.priority) {
        query = query.eq("priority", filters.priority);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch assignee profiles separately
      const assignedToIds = data?.filter(t => t.assigned_to).map(t => t.assigned_to) || [];
      let profilesMap: Record<string, { email: string; display_name: string | null }> = {};
      
      if (assignedToIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, display_name")
          .in("id", assignedToIds);
        
        profiles?.forEach(p => {
          profilesMap[p.id] = { email: p.email, display_name: p.display_name };
        });
      }

      return (data || []).map(task => ({
        ...task,
        assignee: task.assigned_to ? profilesMap[task.assigned_to] || null : null,
      })) as CommitteeTask[];
    },
  });
};

export const useCommitteeTaskMutations = () => {
  const queryClient = useQueryClient();

  const createTask = useMutation({
    mutationFn: async (task: Omit<CommitteeTask, "id" | "created_at" | "updated_at" | "assignee">) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("committee_tasks")
        .insert({ ...task, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committee-tasks"] });
      toast.success("Task created");
    },
    onError: () => toast.error("Failed to create task"),
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CommitteeTask>) => {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }
      const { data, error } = await supabase
        .from("committee_tasks")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committee-tasks"] });
      toast.success("Task updated");
    },
    onError: () => toast.error("Failed to update task"),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("committee_tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["committee-tasks"] });
      toast.success("Task deleted");
    },
    onError: () => toast.error("Failed to delete task"),
  });

  return { createTask, updateTask, deleteTask };
};

export const COMMITTEE_LABELS: Record<CommitteeType, string> = {
  board: "Board",
  fundraising: "Fundraising",
  fields: "Fields & Grounds",
  concessions: "Concessions",
  equipment: "Equipment",
  events: "Events",
  communications: "Communications",
  safety: "Safety",
  umpires: "Umpires",
  other: "Other",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  blocked: "Blocked",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};
