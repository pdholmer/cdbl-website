import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeDraft } from "@/hooks/useRealtimeDraft";
import { useDraftMutations } from "@/hooks/useDraftMutations";
import { useDraftPlayerQueue, useDraftPlayerQueueMutations } from "@/hooks/useDraftPlayerQueue";
import { DraftStatusHeader } from "@/components/draft/DraftStatusHeader";
import { PickTimer } from "@/components/draft/PickTimer";
import { DraftBoard } from "@/components/draft/DraftBoard";
import { AvailablePlayers } from "@/components/draft/AvailablePlayers";
import { PlayerQueue } from "@/components/draft/PlayerQueue";
import { MyRoster } from "@/components/draft/MyRoster";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { calculateCurrentTeamOrder, getTotalPicks } from "@/utils/draftUtils";
import { ArrowLeft } from "lucide-react";

const CoachDraftRoom = () => {
  const { id: draftId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [myDraftTeamId, setMyDraftTeamId] = useState<string | null>(null);
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [pickStartTime, setPickStartTime] = useState<Date | null>(null);
  
  const { draft, picks, draftTeams, availablePlayers, isLoading, isConnected, refetch } = useRealtimeDraft(draftId);
  const { makePick } = useDraftMutations();
  const { data: queuedPlayers } = useDraftPlayerQueue(myDraftTeamId || undefined);
  const { addToQueue, removeFromQueue, reorderQueue, clearQueue } = useDraftPlayerQueueMutations();

  // Load coach's draft team
  useEffect(() => {
    const loadMyTeam = async () => {
      if (!draftId) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: myDraftTeam } = await supabase
        .from('draft_teams')
        .select('id, team_id')
        .eq('draft_id', draftId)
        .eq('coach_user_id', user.id)
        .single();

      if (myDraftTeam) {
        setMyDraftTeamId(myDraftTeam.id);
        setMyTeamId(myDraftTeam.team_id);
      }
    };

    loadMyTeam();
  }, [draftId]);

  // Calculate if it's my turn
  const isMyTurn = useMemo(() => {
    if (!draft || !draftTeams.length || !myDraftTeamId) return false;
    
    const currentTeamOrder = calculateCurrentTeamOrder(
      draft.current_pick,
      draftTeams.length,
      (draft.draft_type as 'snake' | 'linear') || 'snake'
    );
    
    const myTeam = draftTeams.find(t => t.id === myDraftTeamId);
    return myTeam?.draft_order === currentTeamOrder;
  }, [draft, draftTeams, myDraftTeamId]);

  // Get current team on the clock
  const onTheClockTeam = useMemo(() => {
    if (!draft || !draftTeams.length) return null;
    
    const currentTeamOrder = calculateCurrentTeamOrder(
      draft.current_pick,
      draftTeams.length,
      (draft.draft_type as 'snake' | 'linear') || 'snake'
    );
    
    return draftTeams.find(t => t.draft_order === currentTeamOrder) || null;
  }, [draft, draftTeams]);

  // Reset timer when pick changes
  useEffect(() => {
    if (draft?.current_pick) {
      setPickStartTime(new Date());
    }
  }, [draft?.current_pick]);

  // Get my picks
  const myPicks = useMemo(() => {
    return picks.filter(p => p.draft_team.id === myDraftTeamId);
  }, [picks, myDraftTeamId]);

  // Get my team info
  const myTeamInfo = useMemo(() => {
    const team = draftTeams.find(t => t.id === myDraftTeamId);
    return team?.team || null;
  }, [draftTeams, myDraftTeamId]);

  // Get drafted player IDs
  const draftedPlayerIds = useMemo(() => {
    return picks.map(p => p.player.id);
  }, [picks]);

  // Get queued player IDs
  const queuedPlayerIds = useMemo(() => {
    return (queuedPlayers || []).map(qp => qp.player.id);
  }, [queuedPlayers]);

  // Handle drafting a player
  const handleDraftPlayer = useCallback(async (playerId: string) => {
    if (!draft || !myDraftTeamId || !isMyTurn) return;

    try {
      await makePick.mutateAsync({
        draftId: draft.id,
        draftTeamId: myDraftTeamId,
        playerId,
        roundNumber: Math.ceil(draft.current_pick / draftTeams.length),
        pickNumber: draft.current_pick,
        pickInRound: ((draft.current_pick - 1) % draftTeams.length) + 1,
        isAutoPick: false,
        timeSpent: pickStartTime ? Math.floor((Date.now() - pickStartTime.getTime()) / 1000) : null
      });

      toast({
        title: "Player Drafted!",
        description: "Your pick has been recorded.",
      });
    } catch (error) {
      console.error("Error making pick:", error);
      toast({
        title: "Error",
        description: "Failed to make pick. Please try again.",
        variant: "destructive"
      });
    }
  }, [draft, myDraftTeamId, isMyTurn, draftTeams.length, pickStartTime, makePick, toast]);

  // Handle adding to queue
  const handleAddToQueue = useCallback(async (playerId: string) => {
    if (!myDraftTeamId) return;
    
    const nextOrder = (queuedPlayers?.length || 0) + 1;
    await addToQueue.mutateAsync({
      draftTeamId: myDraftTeamId,
      playerId,
      queueOrder: nextOrder
    });
  }, [myDraftTeamId, queuedPlayers, addToQueue]);

  // Handle queue operations
  const handleRemoveFromQueue = useCallback(async (queueId: string) => {
    await removeFromQueue.mutateAsync(queueId);
  }, [removeFromQueue]);

  const handleMoveUp = useCallback(async (queueId: string) => {
    if (!queuedPlayers) return;
    const index = queuedPlayers.findIndex(qp => qp.id === queueId);
    if (index <= 0) return;
    
    const newOrder = [...queuedPlayers];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    
    await reorderQueue.mutateAsync(
      newOrder.map((qp, i) => ({ id: qp.id, queueOrder: i + 1 }))
    );
  }, [queuedPlayers, reorderQueue]);

  const handleMoveDown = useCallback(async (queueId: string) => {
    if (!queuedPlayers) return;
    const index = queuedPlayers.findIndex(qp => qp.id === queueId);
    if (index < 0 || index >= queuedPlayers.length - 1) return;
    
    const newOrder = [...queuedPlayers];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    
    await reorderQueue.mutateAsync(
      newOrder.map((qp, i) => ({ id: qp.id, queueOrder: i + 1 }))
    );
  }, [queuedPlayers, reorderQueue]);

  const handleClearQueue = useCallback(async () => {
    if (!myDraftTeamId) return;
    await clearQueue.mutateAsync(myDraftTeamId);
  }, [myDraftTeamId, clearQueue]);

  // Handle timer expiration (auto-pick)
  const handleTimeExpired = useCallback(() => {
    if (!isMyTurn || !queuedPlayers?.length) return;
    
    // Find first available player in queue
    const firstAvailable = queuedPlayers.find(qp => !draftedPlayerIds.includes(qp.player.id));
    if (firstAvailable) {
      handleDraftPlayer(firstAvailable.player.id);
    }
  }, [isMyTurn, queuedPlayers, draftedPlayerIds, handleDraftPlayer]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Draft not found</p>
          <Button variant="outline" onClick={() => navigate('/coach')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const totalPicks = getTotalPicks(draftTeams.length, draft.total_rounds);
  const isPaused = draft.status === 'paused';
  const isCompleted = draft.status === 'completed';

  return (
    <div className="flex flex-col h-screen">
      {/* Status Header */}
      <DraftStatusHeader
        draftName={draft.name}
        currentRound={Math.ceil(draft.current_pick / draftTeams.length)}
        totalRounds={draft.total_rounds}
        currentPick={draft.current_pick}
        totalPicks={totalPicks}
        status={draft.status}
        onTheClockTeam={onTheClockTeam}
        isConnected={isConnected}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 h-full">
          {/* Left Column - Timer & Queue */}
          <div className="col-span-3 flex flex-col gap-4">
            {/* Timer */}
            {!isCompleted && (
              <PickTimer
                timeLimit={draft.pick_time_limit}
                isMyTurn={isMyTurn}
                isPaused={isPaused}
                onTimeExpired={handleTimeExpired}
                pickStartTime={pickStartTime || undefined}
              />
            )}
            
            {/* Player Queue */}
            <div className="flex-1 min-h-0">
              <PlayerQueue
                queuedPlayers={queuedPlayers || []}
                onRemove={handleRemoveFromQueue}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onClearQueue={handleClearQueue}
                draftedPlayerIds={draftedPlayerIds}
                isMyTurn={isMyTurn && !isPaused && !isCompleted}
                onDraftFromQueue={handleDraftPlayer}
              />
            </div>
          </div>

          {/* Center Column - Draft Board */}
          <div className="col-span-6 min-h-0 overflow-hidden">
            <DraftBoard
              draftTeams={draftTeams}
              picks={picks}
              totalRounds={draft.total_rounds}
              currentRound={Math.ceil(draft.current_pick / draftTeams.length)}
              currentPick={draft.current_pick}
              draftType={(draft.draft_type as 'snake' | 'linear') || 'snake'}
              myTeamId={myTeamId || undefined}
            />
          </div>

          {/* Right Column - Available Players & My Roster */}
          <div className="col-span-3 flex flex-col gap-4">
            {/* My Roster */}
            <div className="h-[200px]">
              <MyRoster
                picks={myPicks}
                teamName={myTeamInfo?.name || 'My Team'}
                teamColor={myTeamInfo?.color_primary}
                maxRosterSize={draft.total_rounds}
                totalRounds={draft.total_rounds}
              />
            </div>
            
            {/* Available Players */}
            <div className="flex-1 min-h-0">
              <AvailablePlayers
                players={availablePlayers}
                isMyTurn={isMyTurn && !isPaused && !isCompleted}
                onDraftPlayer={handleDraftPlayer}
                onAddToQueue={handleAddToQueue}
                queuedPlayerIds={queuedPlayerIds}
                isLoading={makePick.isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDraftRoom;
