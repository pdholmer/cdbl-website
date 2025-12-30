import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { useRealtimeDraft } from "@/hooks/useRealtimeDraft";
import { useDraftMutations } from "@/hooks/useDraftMutations";
import { DraftStatusHeader } from "@/components/draft/DraftStatusHeader";
import { DraftBoard } from "@/components/draft/DraftBoard";
import { AvailablePlayers } from "@/components/draft/AvailablePlayers";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { calculateCurrentTeamOrder, getTotalPicks } from "@/utils/draftUtils";
import { ArrowLeft, Users, Play } from "lucide-react";

const DraftLive = () => {
  const { id: draftId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { draft, picks, draftTeams, availablePlayers, isLoading, isConnected } = useRealtimeDraft(draftId);
  const { updateDraft, makePick } = useDraftMutations();

  // Filter teams with valid team data for display
  const validDraftTeams = useMemo(() => {
    return draftTeams.filter(t => t.team !== null) as Array<typeof draftTeams[0] & { team: NonNullable<typeof draftTeams[0]['team']> }>;
  }, [draftTeams]);

  // Get current team on the clock
  const onTheClockTeam = useMemo(() => {
    if (!draft || !validDraftTeams.length) return null;
    
    const currentTeamOrder = calculateCurrentTeamOrder(
      draft.current_pick,
      validDraftTeams.length,
      (draft.draft_type as 'snake' | 'linear') || 'snake'
    );
    
    const team = validDraftTeams.find(t => t.draft_order === currentTeamOrder);
    return team || null;
  }, [draft, validDraftTeams]);

  // Handle pause/resume
  const handlePause = async () => {
    if (!draft) return;
    try {
      await updateDraft.mutateAsync({
        id: draft.id,
        status: 'paused'
      });
      toast({ title: "Draft Paused" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to pause draft", variant: "destructive" });
    }
  };

  const handleResume = async () => {
    if (!draft) return;
    try {
      await updateDraft.mutateAsync({
        id: draft.id,
        status: 'in_progress'
      });
      toast({ title: "Draft Resumed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to resume draft", variant: "destructive" });
    }
  };

  const handleComplete = async () => {
    if (!draft) return;
    try {
      await updateDraft.mutateAsync({
        id: draft.id,
        status: 'completed',
        completed_at: new Date().toISOString()
      });
      toast({ title: "Draft Completed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to complete draft", variant: "destructive" });
    }
  };

  // Handle making a pick for a team (commissioner override)
  const handleMakePickForTeam = async (playerId: string) => {
    if (!draft || !onTheClockTeam) return;
    
    try {
      await makePick.mutateAsync({
        draft_id: draft.id,
        draft_team_id: onTheClockTeam.id,
        player_id: playerId,
        round_number: Math.ceil(draft.current_pick / draftTeams.length),
        pick_number: draft.current_pick,
        pick_in_round: ((draft.current_pick - 1) % draftTeams.length) + 1,
        is_auto_pick: true,
        time_spent: undefined
      });
      
      toast({ title: "Pick Made", description: "Pick recorded successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to make pick", variant: "destructive" });
    }
  };

  // Start the draft
  const handleStartDraft = async () => {
    if (!draft) return;
    try {
      await updateDraft.mutateAsync({
        id: draft.id,
        status: 'in_progress',
        actual_start: new Date().toISOString()
      });
      toast({ title: "Draft Started!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to start draft", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!draft) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Draft not found</p>
            <Button variant="outline" onClick={() => navigate('/admin/drafts')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Drafts
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const totalPicks = getTotalPicks(draftTeams.length, draft.total_rounds);
  const isSetup = draft.status === 'setup' || draft.status === 'ready';
  const isCompleted = draft.status === 'completed';

  // Show setup view if draft hasn't started
  if (isSetup) {
    return (
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/drafts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">{draft.name}</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Draft Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold">{draftTeams.length}</div>
                  <div className="text-sm text-muted-foreground">Teams</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold">{draft.total_rounds}</div>
                  <div className="text-sm text-muted-foreground">Rounds</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold">{availablePlayers.length}</div>
                  <div className="text-sm text-muted-foreground">Players in Pool</div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  size="lg" 
                  onClick={handleStartDraft}
                  disabled={draftTeams.length < 2 || availablePlayers.length < draftTeams.length}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Draft
                </Button>
              </div>

              {draftTeams.length < 2 && (
                <p className="text-sm text-destructive text-center">
                  Need at least 2 teams to start the draft
                </p>
              )}
            </CardContent>
          </Card>

          {/* Team List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participating Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {draftTeams.map(team => (
                  <div key={team.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: team.team?.color_primary || '#ccc' }}
                    />
                    <span className="font-medium">
                      #{team.draft_order}: {team.team?.name || 'Unknown Team'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
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
          isAdmin={true}
          onPause={handlePause}
          onResume={handleResume}
          onComplete={handleComplete}
        />

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 h-full">
            {/* Left - Team Rosters */}
            <div className="col-span-2 overflow-auto">
              <Card className="h-full">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Teams</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-2">
                  {draftTeams.map(team => {
                    const teamPicks = picks.filter(p => p.draft_team.id === team.id);
                    const isOnClock = onTheClockTeam?.id === team.id;
                    
                    return (
                      <div 
                        key={team.id}
                        className={`p-2 rounded border ${isOnClock ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: team.team?.color_primary || '#ccc' }}
                          />
                          <span className="text-xs font-medium truncate">
                            {team.team?.nickname || team.team?.name || 'Unknown'}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {teamPicks.length}/{draft.total_rounds}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Center - Draft Board */}
            <div className="col-span-7 min-h-0 overflow-hidden">
              <DraftBoard
                draftTeams={validDraftTeams}
                picks={picks}
                totalRounds={draft.total_rounds}
                currentRound={Math.ceil(draft.current_pick / draftTeams.length)}
                currentPick={draft.current_pick}
                draftType={(draft.draft_type as 'snake' | 'linear') || 'snake'}
              />
            </div>

            {/* Right - Available Players */}
            <div className="col-span-3 min-h-0">
              <AvailablePlayers
                players={availablePlayers}
                isMyTurn={!isCompleted && draft.status === 'in_progress'}
                onDraftPlayer={handleMakePickForTeam}
                onAddToQueue={() => {}}
                queuedPlayerIds={[]}
                isLoading={makePick.isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DraftLive;
