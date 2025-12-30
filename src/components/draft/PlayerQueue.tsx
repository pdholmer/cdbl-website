import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, GripVertical, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueuedPlayer {
  id: string;
  queue_order: number;
  player: {
    id: string;
    first_name: string;
    last_name: string;
    age_at_registration: number | null;
    skill_level: string | null;
  };
}

interface PlayerQueueProps {
  queuedPlayers: QueuedPlayer[];
  onRemove: (queueId: string) => void;
  onMoveUp: (queueId: string) => void;
  onMoveDown: (queueId: string) => void;
  onClearQueue: () => void;
  draftedPlayerIds: string[];
  isMyTurn: boolean;
  onDraftFromQueue: (playerId: string) => void;
}

export const PlayerQueue = ({
  queuedPlayers,
  onRemove,
  onMoveUp,
  onMoveDown,
  onClearQueue,
  draftedPlayerIds,
  isMyTurn,
  onDraftFromQueue
}: PlayerQueueProps) => {
  // Filter out drafted players
  const availableInQueue = queuedPlayers.filter(
    qp => !draftedPlayerIds.includes(qp.player.id)
  );

  const getPositionLabel = (index: number) => {
    switch (index) {
      case 0:
        return "1st";
      case 1:
        return "2nd";
      case 2:
        return "3rd";
      default:
        return `${index + 1}th`;
    }
  };

  return (
    <div className="bg-card rounded-lg border h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">My Queue</h3>
            <p className="text-xs text-muted-foreground">
              Auto-picks from top if timer expires
            </p>
          </div>
          {queuedPlayers.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearQueue}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {queuedPlayers.map((queuedPlayer, index) => {
            const isDrafted = draftedPlayerIds.includes(queuedPlayer.player.id);
            const isFirst = index === 0;
            const isLast = index === queuedPlayers.length - 1;

            return (
              <div
                key={queuedPlayer.id}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border transition-colors",
                  isDrafted ? "opacity-50 bg-muted line-through" : "hover:bg-muted/50",
                  isFirst && !isDrafted && isMyTurn && "ring-2 ring-primary bg-primary/5"
                )}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                
                <Badge variant="outline" className="flex-shrink-0 w-10 justify-center">
                  {getPositionLabel(index)}
                </Badge>

                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "font-medium truncate block",
                    isDrafted && "text-muted-foreground"
                  )}>
                    {queuedPlayer.player.first_name} {queuedPlayer.player.last_name}
                  </span>
                  {queuedPlayer.player.age_at_registration && (
                    <span className="text-xs text-muted-foreground">
                      Age {queuedPlayer.player.age_at_registration}
                    </span>
                  )}
                </div>

                {!isDrafted && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onMoveUp(queuedPlayer.id)}
                      disabled={isFirst}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onMoveDown(queuedPlayer.id)}
                      disabled={isLast}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onRemove(queuedPlayer.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {isDrafted && (
                  <Badge variant="secondary" className="text-xs">Drafted</Badge>
                )}
              </div>
            );
          })}

          {queuedPlayers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>No players in queue</p>
              <p className="text-xs mt-1">Add players from the available list</p>
            </div>
          )}

          {/* Draft from queue button when it's my turn */}
          {isMyTurn && availableInQueue.length > 0 && (
            <div className="pt-2 border-t mt-2">
              <Button 
                className="w-full"
                onClick={() => onDraftFromQueue(availableInQueue[0].player.id)}
              >
                Draft {availableInQueue[0].player.first_name} {availableInQueue[0].player.last_name}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
