import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GuardianRecord {
  id: string;
  player_id: string;
  household_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  relationship: string | null;
  is_primary: boolean;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
}

/**
 * Reads guardians for a player through the people spine:
 * household_players -> guardian_households -> guardians (+ household address).
 * The legacy player_guardians table is superseded and frozen read-only.
 */
export const useGuardians = (playerId: string | undefined) => {
  return useQuery<GuardianRecord[]>({
    queryKey: ["guardians", playerId],
    queryFn: async () => {
      if (!playerId) return [];

      const { data: links, error: linkError } = await supabase
        .from("household_players")
        .select("household_id")
        .eq("player_id", playerId);

      if (linkError) throw linkError;
      const householdIds = (links ?? []).map((l) => l.household_id);
      if (householdIds.length === 0) return [];

      const { data, error } = await supabase
        .from("guardian_households")
        .select(
          `household_id,
           is_primary,
           guardians:guardian_id ( id, first_name, last_name, email, phone, relationship ),
           households:household_id ( address_line1, address_line2, city, state, zip_code )`
        )
        .in("household_id", householdIds)
        .order("is_primary", { ascending: false });

      if (error) throw error;

      return (data ?? [])
        .filter((row: any) => row.guardians)
        .map((row: any) => ({
          id: row.guardians.id,
          player_id: playerId,
          household_id: row.household_id,
          first_name: row.guardians.first_name,
          last_name: row.guardians.last_name,
          email: row.guardians.email,
          phone: row.guardians.phone,
          relationship: row.guardians.relationship,
          is_primary: !!row.is_primary,
          address_line1: row.households?.address_line1 ?? null,
          address_line2: row.households?.address_line2 ?? null,
          city: row.households?.city ?? null,
          state: row.households?.state ?? null,
          zip_code: row.households?.zip_code ?? null,
        }));
    },
    enabled: !!playerId,
  });
};
