import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "lucide-react";

interface DraftPick {
  id: string;
  round_number: number;
  pick_number: number;
  player: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface MyRosterProps {
  picks: DraftPick[];
  teamName: string;
  teamColor?: string | null;
  maxRosterSize: number;
  totalRounds: number;
}

export const MyRoster = ({
  picks,
  teamName,
  teamColor,
  maxRosterSize,
  totalRounds
}: MyRosterProps) => {
  // Sort picks by round number
  const sortedPicks = [...picks].sort((a, b) => a.round_number - b.round_number);

  return (
    <div className="bg-card rounded-lg border h-full flex flex-col">
      <div 
        className="p-4 border-b"
        style={{
          borderLeftWidth: '4px',
          borderLeftColor: teamColor || 'transparent'
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{teamName}</h3>
          <Badge variant="outline">
            {picks.length} / {totalRounds}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          My Drafted Players
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sortedPicks.map((pick) => (
            <div
              key={pick.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
            >
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                style={{
                  backgroundColor: teamColor || 'hsl(var(--primary))',
                  color: 'white'
                }}
              >
                {pick.round_number}
              </div>
              
              <div className="flex-1 min-w-0">
                <span className="font-medium truncate block">
                  {pick.player.first_name} {pick.player.last_name}
                </span>
                <span className="text-xs text-muted-foreground">
                  Round {pick.round_number} • Pick #{pick.pick_number}
                </span>
              </div>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: totalRounds - picks.length }, (_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center gap-3 p-3 rounded-lg border border-dashed"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm text-muted-foreground">
                Round {picks.length + i + 1}
              </span>
            </div>
          ))}

          {picks.length === 0 && totalRounds === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No players drafted yet
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
