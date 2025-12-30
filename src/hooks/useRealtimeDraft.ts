import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useDraft } from "./useDrafts";
import { useDraftPicks } from "./useDraftPicks";
import { useDraftTeams } from "./useDraftTeams";
import { useAvailablePlayers } from "./useDraftPlayerPool";

export interface RealtimeDraftState {
  isConnected: boolean;
  lastUpdate: Date | null;
}

export const useRealtimeDraft = (draftId: string | undefined) => {
  const queryClient = useQueryClient();
  const [realtimeState, setRealtimeState] = useState<RealtimeDraftState>({
    isConnected: false,
    lastUpdate: null,
  });

  // Fetch initial data using existing hooks
  const { data: draft, isLoading: draftLoading, refetch: refetchDraft } = useDraft(draftId);
  const { data: picks, isLoading: picksLoading, refetch: refetchPicks } = useDraftPicks(draftId);
  const { data: draftTeams, isLoading: teamsLoading, refetch: refetchTeams } = useDraftTeams(draftId);
  const { data: availablePlayers, isLoading: playersLoading, refetch: refetchPlayers } = useAvailablePlayers(draftId);

  const handleDraftChange = useCallback((payload: any) => {
    console.log("Draft change received:", payload);
    setRealtimeState(prev => ({ ...prev, lastUpdate: new Date() }));
    // Invalidate and refetch draft data
    queryClient.invalidateQueries({ queryKey: ["draft", draftId] });
    refetchDraft();
  }, [draftId, queryClient, refetchDraft]);

  const handlePickChange = useCallback((payload: any) => {
    console.log("Pick change received:", payload);
    setRealtimeState(prev => ({ ...prev, lastUpdate: new Date() }));
    // Invalidate and refetch picks and available players
    queryClient.invalidateQueries({ queryKey: ["draft-picks", draftId] });
    queryClient.invalidateQueries({ queryKey: ["available-players", draftId] });
    queryClient.invalidateQueries({ queryKey: ["draft-player-pool", draftId] });
    refetchPicks();
    refetchPlayers();
  }, [draftId, queryClient, refetchPicks, refetchPlayers]);

  const handlePlayerPoolChange = useCallback((payload: any) => {
    console.log("Player pool change received:", payload);
    setRealtimeState(prev => ({ ...prev, lastUpdate: new Date() }));
    queryClient.invalidateQueries({ queryKey: ["available-players", draftId] });
    queryClient.invalidateQueries({ queryKey: ["draft-player-pool", draftId] });
    refetchPlayers();
  }, [draftId, queryClient, refetchPlayers]);

  useEffect(() => {
    if (!draftId) return;

    console.log("Setting up realtime subscription for draft:", draftId);

    const channel = supabase
      .channel(`draft-room-${draftId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drafts',
          filter: `id=eq.${draftId}`
        },
        handleDraftChange
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'draft_picks',
          filter: `draft_id=eq.${draftId}`
        },
        handlePickChange
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'draft_player_pool',
          filter: `draft_id=eq.${draftId}`
        },
        handlePlayerPoolChange
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
        setRealtimeState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED'
        }));
      });

    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [draftId, handleDraftChange, handlePickChange, handlePlayerPoolChange]);

  const isLoading = draftLoading || picksLoading || teamsLoading || playersLoading;

  return {
    draft,
    picks: picks || [],
    draftTeams: draftTeams || [],
    availablePlayers: availablePlayers || [],
    isLoading,
    isConnected: realtimeState.isConnected,
    lastUpdate: realtimeState.lastUpdate,
    refetch: () => {
      refetchDraft();
      refetchPicks();
      refetchTeams();
      refetchPlayers();
    }
  };
};
