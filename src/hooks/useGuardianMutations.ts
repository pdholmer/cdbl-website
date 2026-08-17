import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GuardianInput {
  player_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  relationship?: string;
  is_primary?: boolean;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

/** Resolve (or create) the household that owns this player, returning ids + tenant key. */
async function resolveHousehold(playerId: string, lastName: string, address: {
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}) {
  const { data: existing, error: existingError } = await supabase
    .from("household_players")
    .select("household_id, league_id")
    .eq("player_id", playerId)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) {
    return { householdId: existing.household_id, leagueId: existing.league_id };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("league_players")
    .select("league_id")
    .eq("player_id", playerId)
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (!membership) throw new Error("Player is not a member of the league yet.");
  const leagueId = membership.league_id;

  const { data: household, error: householdError } = await supabase
    .from("households")
    .insert({
      league_id: leagueId,
      name: `${lastName} Household`.trim(),
      address_line1: address.address_line1 || null,
      address_line2: address.address_line2 || null,
      city: address.city || null,
      state: address.state || null,
      zip_code: address.zip_code || null,
    })
    .select("id")
    .single();
  if (householdError) throw householdError;

  const { error: linkError } = await supabase.from("household_players").insert({
    league_id: leagueId,
    household_id: household.id,
    player_id: playerId,
    role: "manager",
  });
  if (linkError) throw linkError;

  return { householdId: household.id, leagueId };
}

async function applyHouseholdAddress(householdId: string, address: Record<string, string | undefined>) {
  const updates: Record<string, string> = {};
  for (const key of ["address_line1", "address_line2", "city", "state", "zip_code"]) {
    const value = address[key];
    if (value !== undefined && value !== "") updates[key] = value;
  }
  if (Object.keys(updates).length === 0) return;
  const { error } = await supabase.from("households").update(updates).eq("id", householdId);
  if (error) throw error;
}

export const useGuardianMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createGuardian = useMutation({
    mutationFn: async (data: GuardianInput) => {
      const { householdId, leagueId } = await resolveHousehold(
        data.player_id,
        data.last_name,
        data
      );

      const { data: guardian, error: guardianError } = await supabase
        .from("guardians")
        .insert({
          league_id: leagueId,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          relationship: data.relationship ?? null,
        })
        .select("id")
        .single();
      if (guardianError) throw guardianError;

      const isPrimary = !!data.is_primary;
      if (isPrimary) {
        const { error: demoteError } = await supabase
          .from("guardian_households")
          .update({ is_primary: false })
          .eq("household_id", householdId);
        if (demoteError) throw demoteError;
      }

      const { error: linkError } = await supabase.from("guardian_households").insert({
        league_id: leagueId,
        household_id: householdId,
        guardian_id: guardian.id,
        is_primary: isPrimary,
      });
      if (linkError) throw linkError;

      if (isPrimary) await applyHouseholdAddress(householdId, data as any);

      return { id: guardian.id, player_id: data.player_id };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["guardians", variables.player_id] });
      toast({ title: "Success", description: "Guardian added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateGuardian = useMutation({
    mutationFn: async ({
      id,
      player_id,
      is_primary,
      ...data
    }: {
      id: string;
      player_id?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
      relationship?: string;
      is_primary?: boolean;
      address_line1?: string;
      address_line2?: string;
      city?: string;
      state?: string;
      zip_code?: string;
    }) => {
      const guardianFields: Record<string, string | null> = {};
      for (const key of ["first_name", "last_name", "email", "phone", "relationship"]) {
        const value = (data as any)[key];
        if (value !== undefined) guardianFields[key] = value;
      }
      if (Object.keys(guardianFields).length > 0) {
        const { error } = await supabase.from("guardians").update(guardianFields).eq("id", id);
        if (error) throw error;
      }

      const { data: links, error: linksError } = await supabase
        .from("guardian_households")
        .select("household_id")
        .eq("guardian_id", id);
      if (linksError) throw linksError;
      const householdId = links?.[0]?.household_id;

      if (householdId && is_primary !== undefined) {
        if (is_primary) {
          const { error: demoteError } = await supabase
            .from("guardian_households")
            .update({ is_primary: false })
            .eq("household_id", householdId);
          if (demoteError) throw demoteError;
        }
        const { error: primaryError } = await supabase
          .from("guardian_households")
          .update({ is_primary })
          .eq("guardian_id", id)
          .eq("household_id", householdId);
        if (primaryError) throw primaryError;
      }

      if (householdId && is_primary) {
        await applyHouseholdAddress(householdId, data as any);
      }

      return { id, player_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["guardians", data.player_id] });
      toast({ title: "Success", description: "Guardian updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteGuardian = useMutation({
    mutationFn: async ({ id, player_id }: { id: string; player_id: string }) => {
      const { error: unlinkError } = await supabase
        .from("guardian_households")
        .delete()
        .eq("guardian_id", id);
      if (unlinkError) throw unlinkError;

      const { data: remaining, error: remainingError } = await supabase
        .from("guardian_households")
        .select("guardian_id")
        .eq("guardian_id", id);
      if (remainingError) throw remainingError;

      if (!remaining || remaining.length === 0) {
        const { error: deleteError } = await supabase.from("guardians").delete().eq("id", id);
        if (deleteError) throw deleteError;
      }

      return { player_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["guardians", data.player_id] });
      toast({ title: "Success", description: "Guardian removed successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return { createGuardian, updateGuardian, deleteGuardian };
};
