import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VenueField {
  id: string;
  venue_id: string;
  field_number: string;
  field_name?: string | null;
  divisions?: string[] | null;
  status: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const useVenueFields = (venueId?: string) => {
  return useQuery({
    queryKey: ["venue-fields", venueId],
    queryFn: async () => {
      let query = supabase
        .from("venue_fields")
        .select("*")
        .order("field_number", { ascending: true });

      if (venueId) {
        query = query.eq("venue_id", venueId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as VenueField[];
    },
    enabled: !!venueId,
  });
};

export const useVenueFieldMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createField = useMutation({
    mutationFn: async (field: any) => {
      const { data, error } = await supabase
        .from("venue_fields")
        .insert(field as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venue-fields"] });
      toast({
        title: "Field added",
        description: "Field has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateField = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("venue_fields")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venue-fields"] });
      toast({
        title: "Field updated",
        description: "Field has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteField = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("venue_fields").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venue-fields"] });
      toast({
        title: "Field deleted",
        description: "Field has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createField,
    updateField,
    deleteField,
  };
};
