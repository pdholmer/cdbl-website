import { Calendar, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeamOption } from "@/data/teamData";
import { cn } from "@/lib/utils";

interface ScheduleFilterToolbarProps {
  viewMode: 'calendar' | 'list';
  onViewModeChange: (mode: 'calendar' | 'list') => void;
  selectedLeague: 'in-house' | 'travel' | 'all';
  onLeagueChange: (league: 'in-house' | 'travel' | 'all') => void;
  selectedTeam: string | 'all';
  onTeamChange: (teamId: string | 'all') => void;
  availableTeams: TeamOption[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export const ScheduleFilterToolbar = ({
  viewMode,
  onViewModeChange,
  selectedLeague,
  onLeagueChange,
  selectedTeam,
  onTeamChange,
  availableTeams,
  hasActiveFilters,
  onClearFilters,
}: ScheduleFilterToolbarProps) => {
  return (
    <div className="mb-6">
      {/* Desktop Layout - Single Row */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        {/* View Toggle Icons */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewModeChange('calendar')}
            className={cn(
              "h-10 w-10 rounded-md transition-all duration-300",
              viewMode === 'calendar'
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            aria-label="Switch to Calendar View"
            aria-pressed={viewMode === 'calendar'}
          >
            <Calendar className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewModeChange('list')}
            className={cn(
              "h-10 w-10 rounded-md transition-all duration-300",
              viewMode === 'list'
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            aria-label="Switch to List View"
            aria-pressed={viewMode === 'list'}
          >
            <List className="h-5 w-5" />
          </Button>
        </div>

        {/* League Filter */}
        <Select value={selectedLeague} onValueChange={onLeagueChange}>
          <SelectTrigger 
            className="w-[180px] font-heading border-input focus:border-gold"
            aria-label="Filter by League"
          >
            <SelectValue placeholder="All Leagues" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all" className="font-sans">All Leagues</SelectItem>
            <SelectItem value="in-house" className="font-sans">🧢 In-House</SelectItem>
            <SelectItem value="travel" className="font-sans">🚀 Travel</SelectItem>
          </SelectContent>
        </Select>

        {/* Team Filter */}
        <Select value={selectedTeam} onValueChange={onTeamChange}>
          <SelectTrigger 
            className="w-[200px] font-heading border-input focus:border-gold"
            aria-label="Filter by Team"
          >
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all" className="font-sans">All Teams</SelectItem>
            {availableTeams.map((team) => (
              <SelectItem key={team.id} value={team.id} className="font-sans">
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Clear all active filters"
          >
            Clear Filters
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Mobile Layout - Two Rows */}
      <div className="md:hidden space-y-3">
        {/* Row 1: View Toggle Icons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewModeChange('calendar')}
            className={cn(
              "h-11 w-11 rounded-md transition-all duration-300",
              viewMode === 'calendar'
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            aria-label="Switch to Calendar View"
            aria-pressed={viewMode === 'calendar'}
          >
            <Calendar className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewModeChange('list')}
            className={cn(
              "h-11 w-11 rounded-md transition-all duration-300",
              viewMode === 'list'
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            aria-label="Switch to List View"
            aria-pressed={viewMode === 'list'}
          >
            <List className="h-5 w-5" />
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="ml-auto text-muted-foreground hover:text-foreground"
            >
              Clear
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Row 2: Dropdowns */}
        <div className="flex flex-col gap-3">
          <Select value={selectedLeague} onValueChange={onLeagueChange}>
            <SelectTrigger 
              className="w-full font-heading border-input focus:border-gold h-11"
              aria-label="Filter by League"
            >
              <SelectValue placeholder="All Leagues" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all" className="font-sans">All Leagues</SelectItem>
              <SelectItem value="in-house" className="font-sans">🧢 In-House</SelectItem>
              <SelectItem value="travel" className="font-sans">🚀 Travel</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedTeam} onValueChange={onTeamChange}>
            <SelectTrigger 
              className="w-full font-heading border-input focus:border-gold h-11"
              aria-label="Filter by Team"
            >
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all" className="font-sans">All Teams</SelectItem>
              {availableTeams.map((team) => (
                <SelectItem key={team.id} value={team.id} className="font-sans">
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
