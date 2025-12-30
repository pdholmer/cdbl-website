import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { calculateCurrentTeamOrder } from "@/utils/draftUtils";

interface DraftTeam {
  id: string;
  draft_order: number;
  team: {
    id: string;
    name: string;
    nickname: string | null;
    color_primary: string | null;
  } | null;
}

interface DraftPick {
  id: string;
  round_number: number;
  pick_number: number;
  pick_in_round: number;
  player: {
    id: string;
    first_name: string;
    last_name: string;
  };
  draft_team: {
    id: string;
    team_id: string;
    draft_order: number;
    team: {
      id: string;
      name: string;
      nickname: string | null;
      color_primary: string | null;
    } | null;
  };
}

interface DraftBoardProps {
  draftTeams: DraftTeam[];
  picks: DraftPick[];
  totalRounds: number;
  currentRound: number;
  currentPick: number;
  draftType: 'snake' | 'linear';
  myTeamId?: string;
}

export const DraftBoard = ({
  draftTeams,
  picks,
  totalRounds,
  currentRound,
  currentPick,
  draftType,
  myTeamId
}: DraftBoardProps) => {
  // Sort teams by draft order
  const sortedTeams = useMemo(() => {
    return [...draftTeams].sort((a, b) => a.draft_order - b.draft_order);
  }, [draftTeams]);

  // Create a lookup for picks by round and team
  const picksByRoundAndTeam = useMemo(() => {
    const lookup: Record<string, DraftPick> = {};
    picks.forEach(pick => {
      const key = `${pick.round_number}-${pick.draft_team.id}`;
      lookup[key] = pick;
    });
    return lookup;
  }, [picks]);

  // Get current team on the clock
  const currentTeamOrder = calculateCurrentTeamOrder(currentPick, sortedTeams.length, draftType);
  const currentTeam = sortedTeams.find(t => t.draft_order === currentTeamOrder);

  // Generate rounds array
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);

  return (
    <div className="bg-card rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Draft Board</h3>
        <p className="text-sm text-muted-foreground">
          {draftType === 'snake' ? 'Snake Draft' : 'Linear Draft'} • {sortedTeams.length} Teams • {totalRounds} Rounds
        </p>
      </div>
      
      <ScrollArea className="w-full">
        <div className="min-w-max p-4">
          {/* Header row with team names */}
          <div className="flex gap-1 mb-2">
            <div className="w-16 flex-shrink-0" /> {/* Spacer for round labels */}
            {sortedTeams.map(team => (
              <div
                key={team.id}
                className={cn(
                  "w-32 flex-shrink-0 p-2 rounded-t-lg text-center text-sm font-medium truncate",
                  team.team?.id === myTeamId && "ring-2 ring-primary",
                  currentTeam?.id === team.id && "bg-primary text-primary-foreground"
                )}
                style={{
                  backgroundColor: currentTeam?.id === team.id 
                    ? undefined 
                    : team.team?.color_primary || undefined,
                  color: team.team?.color_primary && currentTeam?.id !== team.id ? 'white' : undefined
                }}
              >
                {team.team?.nickname || team.team?.name || `Team ${team.draft_order}`}
              </div>
            ))}
          </div>

          {/* Rounds */}
          {rounds.map(round => {
            const isSnakeReverse = draftType === 'snake' && round % 2 === 0;
            const roundTeams = isSnakeReverse ? [...sortedTeams].reverse() : sortedTeams;
            
            return (
              <div key={round} className="flex gap-1 mb-1 items-center">
                {/* Round label */}
                <div className="w-16 flex-shrink-0 flex items-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    R{round}
                  </span>
                  {draftType === 'snake' && (
                    isSnakeReverse 
                      ? <ChevronLeft className="h-3 w-3 text-muted-foreground" />
                      : <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>

                {/* Picks for this round */}
                {sortedTeams.map(team => {
                  const pick = picksByRoundAndTeam[`${round}-${team.id}`];
                  const isCurrentPick = round === currentRound && team.id === currentTeam?.id;
                  const isMyTeam = team.team?.id === myTeamId;
                  
                  return (
                    <div
                      key={`${round}-${team.id}`}
                      className={cn(
                        "w-32 flex-shrink-0 h-12 rounded border flex items-center justify-center text-xs",
                        pick ? "bg-muted" : "bg-background",
                        isCurrentPick && !pick && "ring-2 ring-primary animate-pulse bg-primary/10",
                        isMyTeam && "border-primary",
                        !pick && round > currentRound && "opacity-50"
                      )}
                    >
                      {pick ? (
                        <div className="text-center px-1 truncate">
                          <div className="font-medium truncate">
                            {pick.player.first_name} {pick.player.last_name}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            Pick #{pick.pick_number}
                          </div>
                        </div>
                      ) : isCurrentPick ? (
                        <span className="text-primary font-medium">On Clock</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
