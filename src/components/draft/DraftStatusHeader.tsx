import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, Pause, Play, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface DraftStatusHeaderProps {
  draftName: string;
  currentRound: number;
  totalRounds: number;
  currentPick: number;
  totalPicks: number;
  status: string;
  onTheClockTeam: DraftTeam | null;
  isConnected: boolean;
  isAdmin?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onComplete?: () => void;
}

export const DraftStatusHeader = ({
  draftName,
  currentRound,
  totalRounds,
  currentPick,
  totalPicks,
  status,
  onTheClockTeam,
  isConnected,
  isAdmin,
  onPause,
  onResume,
  onComplete
}: DraftStatusHeaderProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-green-500 text-white">Live</Badge>;
      case 'paused':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">Paused</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="bg-card border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left section - Draft info */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold">{draftName}</h1>
              <p className="text-sm text-muted-foreground">
                Round {currentRound} of {totalRounds} • Pick {currentPick} of {totalPicks}
              </p>
            </div>
            {getStatusBadge()}
            
            {/* Connection indicator */}
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isConnected ? "text-green-600" : "text-red-600"
            )}>
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>Reconnecting...</span>
                </>
              )}
            </div>
          </div>

          {/* Center section - On the Clock */}
          {status === 'in_progress' && onTheClockTeam && (
            <div className="flex items-center gap-3 px-6 py-2 bg-primary/10 rounded-lg border border-primary/20">
              <span className="text-sm font-medium text-muted-foreground">On The Clock:</span>
              <div className="flex items-center gap-2">
                {onTheClockTeam.team?.color_primary && (
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: onTheClockTeam.team.color_primary }}
                  />
                )}
                <span className="font-bold text-lg">
                  {onTheClockTeam.team?.name || 'Unknown Team'}
                </span>
              </div>
            </div>
          )}

          {/* Right section - Admin controls */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              {status === 'in_progress' && (
                <Button variant="outline" size="sm" onClick={onPause}>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              )}
              {status === 'paused' && (
                <Button variant="outline" size="sm" onClick={onResume}>
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </Button>
              )}
              {(status === 'in_progress' || status === 'paused') && (
                <Button variant="destructive" size="sm" onClick={onComplete}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete Draft
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
