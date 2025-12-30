import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CoachInvitation {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  program_id: string | null;
  division_id: string | null;
  team_id: string | null;
  invited_by: string | null;
  token: string;
  status: string;
  expires_at: string;
  created_at: string;
  accepted_at: string | null;
  program?: {
    id: string;
    name: string;
  } | null;
  division?: {
    id: string;
    name: string;
  } | null;
  team?: {
    id: string;
    name: string;
  } | null;
}

export function useCoachInvitations(programId?: string) {
  return useQuery({
    queryKey: ["coach-invitations", programId],
    queryFn: async () => {
      let query = supabase
        .from("coach_invitations")
        .select(`
          *,
          program:programs(id, name),
          division:divisions(id, name),
          team:teams(id, name)
        `)
        .order("created_at", { ascending: false });

      if (programId) {
        query = query.eq("program_id", programId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CoachInvitation[];
    },
  });
}

export function useCreateCoachInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitation: {
      email: string;
      first_name: string;
      last_name: string;
      phone?: string;
      program_id?: string;
      division_id?: string;
      team_id?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("coach_invitations")
        .insert({
          ...invitation,
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-invitations"] });
      toast.success("Coach invitation created");
    },
    onError: (error) => {
      toast.error("Failed to create invitation: " + error.message);
    },
  });
}

export function useCancelCoachInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("coach_invitations")
        .update({ status: "cancelled" })
        .eq("id", invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-invitations"] });
      toast.success("Invitation cancelled");
    },
    onError: (error) => {
      toast.error("Failed to cancel invitation: " + error.message);
    },
  });
}

export function useResendCoachInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      // Reset the expiration date
      const { error } = await supabase
        .from("coach_invitations")
        .update({ 
          status: "pending",
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-invitations"] });
      toast.success("Invitation resent");
    },
    onError: (error) => {
      toast.error("Failed to resend invitation: " + error.message);
    },
  });
}
