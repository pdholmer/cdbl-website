import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PoolPlayer {
  id: string;
  player_id: string;
  is_available: boolean;
  skill_rating: number | null;
  draft_notes: string | null;
  player: {
    id: string;
    first_name: string;
    last_name: string;
    age_at_registration: number | null;
    skill_level: string | null;
    previous_experience: boolean | null;
  };
}

interface AvailablePlayersProps {
  players: PoolPlayer[];
  isMyTurn: boolean;
  onDraftPlayer: (playerId: string) => void;
  onAddToQueue: (playerId: string) => void;
  queuedPlayerIds: string[];
  isLoading?: boolean;
}

export const AvailablePlayers = ({
  players,
  isMyTurn,
  onDraftPlayer,
  onAddToQueue,
  queuedPlayerIds,
  isLoading
}: AvailablePlayersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  const filteredAndSortedPlayers = useMemo(() => {
    let result = players.filter(p => p.is_available);

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.player.first_name.toLowerCase().includes(search) ||
        p.player.last_name.toLowerCase().includes(search)
      );
    }

    // Apply skill filter
    if (skillFilter !== "all") {
      result = result.filter(p => p.player.skill_level === skillFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.player.last_name} ${a.player.first_name}`.localeCompare(
            `${b.player.last_name} ${b.player.first_name}`
          );
        case "age":
          return (b.player.age_at_registration || 0) - (a.player.age_at_registration || 0);
        case "rating":
          return (b.skill_rating || 0) - (a.skill_rating || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [players, searchTerm, skillFilter, sortBy]);

  const getSkillBadge = (skillLevel: string | null) => {
    switch (skillLevel) {
      case "beginner":
        return <Badge variant="secondary" className="text-xs">Beginner</Badge>;
      case "intermediate":
        return <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">Intermediate</Badge>;
      case "advanced":
        return <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Advanced</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-card rounded-lg border h-full flex flex-col">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Available Players</h3>
          <Badge variant="outline">{filteredAndSortedPlayers.length} players</Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Skill Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Skills</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="age">Age</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredAndSortedPlayers.map(poolPlayer => {
            const player = poolPlayer.player;
            const isQueued = queuedPlayerIds.includes(player.id);
            
            return (
              <div
                key={poolPlayer.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors",
                  isQueued && "bg-primary/5 border-primary/20"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {player.first_name} {player.last_name}
                    </span>
                    {getSkillBadge(player.skill_level)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {player.age_at_registration && (
                      <span>Age {player.age_at_registration}</span>
                    )}
                    {player.previous_experience && (
                      <span>• Experienced</span>
                    )}
                    {poolPlayer.skill_rating && (
                      <span>• Rating: {poolPlayer.skill_rating}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  {!isQueued && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddToQueue(player.id)}
                      title="Add to queue"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                  {isMyTurn && (
                    <Button
                      size="sm"
                      onClick={() => onDraftPlayer(player.id)}
                      disabled={isLoading}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Draft
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredAndSortedPlayers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No players found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
