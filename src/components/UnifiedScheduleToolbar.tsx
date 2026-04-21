import { Home, Trophy, Users, Calendar as CalendarIcon, Calendar, List, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Program, Division, Team } from "@/hooks/useTeamHierarchy";

interface UnifiedScheduleToolbarProps {
  // Event type filtering (was tabs)
  activeCategory: 'all' | 'event' | 'practice' | 'game';
  onCategoryChange: (category: 'all' | 'event' | 'practice' | 'game') => void;
  
  // Program, Division & Team filtering (new hierarchy)
  selectedProgram: string | 'all';
  onProgramChange: (programId: string | 'all') => void;
  availablePrograms: Program[];
  
  selectedDivision: string | 'all';
  onDivisionChange: (divisionId: string | 'all') => void;
  availableDivisions: Division[];
  
  selectedTeam: string | 'all';
  onTeamChange: (teamId: string | 'all') => void;
  availableTeams: Team[];
  
  selectedLocation: string | 'all';
  onLocationChange: (location: string | 'all') => void;
  availableLocations: string[];
  
  // View mode toggle
  viewMode: 'calendar' | 'list';
  onViewModeChange: (mode: 'calendar' | 'list') => void;
  
  // Filter state & actions
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  
  // Active filter display
  activeFilterText?: string;
}

const categoryOptions = [
  { value: 'all', label: 'All', icon: Home },
  { value: 'game', label: 'Games', icon: Trophy },
  { value: 'practice', label: 'Practices', icon: Users },
  { value: 'event', label: 'Events', icon: CalendarIcon },
] as const;

export const UnifiedScheduleToolbar = ({
  activeCategory,
  onCategoryChange,
  selectedProgram,
  onProgramChange,
  availablePrograms,
  selectedDivision,
  onDivisionChange,
  availableDivisions,
  selectedTeam,
  onTeamChange,
  availableTeams,
  viewMode,
  onViewModeChange,
  hasActiveFilters,
  onClearFilters,
  activeFilterText,
}: UnifiedScheduleToolbarProps) => {
  // Cascading filter handlers
  const handleProgramChange = (programId: string | 'all') => {
    onProgramChange(programId);
    onDivisionChange('all');
    onTeamChange('all');
  };

  const handleDivisionChange = (divisionId: string | 'all') => {
    onDivisionChange(divisionId);
    onTeamChange('all');
  };
  return (
    <div className="space-y-4">
      {/* Active Filter Badge - Shows when filters are applied */}
      {activeFilterText && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20 animate-fade-in">
          <p className="text-sm font-medium text-foreground">
            Now viewing: <span className="text-primary font-bold">{activeFilterText}</span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 gap-1.5 hover:bg-destructive/10 hover:text-destructive"
          >
            <span className="text-xs">Clear</span>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Desktop Layout - Single Row */}
      <div className="hidden md:flex items-center gap-4 flex-wrap">
        {/* Event Type Pills */}
        <div className="flex gap-2">
          {categoryOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onCategoryChange(value as typeof activeCategory)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-full",
                "font-heading font-semibold text-sm transition-all duration-300",
                "hover:scale-105 hover:shadow-md",
                activeCategory === value
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              aria-label={`Show ${label.toLowerCase()}`}
              role="tab"
              aria-selected={activeCategory === value}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-border" />

        {/* Program Dropdown */}
        <Select value={selectedProgram} onValueChange={handleProgramChange}>
          <SelectTrigger className="w-[180px] rounded-2xl border-2 hover:border-accent transition-colors" aria-label="Filter by Program">
            <SelectValue placeholder="All Programs" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-background">
            <SelectItem value="all">All Programs</SelectItem>
            {availablePrograms.map((program) => (
              <SelectItem key={program.id} value={program.id}>
                {program.type === 'in_house' ? '🧢' : '🚀'} {program.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Division Dropdown */}
        <Select value={selectedDivision} onValueChange={handleDivisionChange}>
          <SelectTrigger className="w-[160px] rounded-2xl border-2 hover:border-accent transition-colors" aria-label="Filter by Division">
            <SelectValue placeholder="All Divisions" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-background max-h-[300px]">
            <SelectItem value="all">All Divisions</SelectItem>
            {availableDivisions.map((division) => (
              <SelectItem key={division.id} value={division.id}>
                {division.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Team Dropdown */}
        <Select value={selectedTeam} onValueChange={onTeamChange}>
          <SelectTrigger className="w-[200px] rounded-2xl border-2 hover:border-accent transition-colors" aria-label="Filter by Team">
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-background max-h-[300px]">
            <SelectItem value="all">All Teams</SelectItem>
            {availableTeams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Spacer */}
        <div className="flex-1" />

        {/* View Toggle Icons */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewModeChange('calendar')}
            className={cn(
              "p-2.5 rounded-lg transition-all duration-300",
              "hover:scale-105",
              viewMode === 'calendar'
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            aria-label="Switch to Calendar View"
            aria-pressed={viewMode === 'calendar'}
          >
            <Calendar className="h-5 w-5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              "p-2.5 rounded-lg transition-all duration-300",
              "hover:scale-105",
              viewMode === 'list'
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            aria-label="Switch to List View"
            aria-pressed={viewMode === 'list'}
          >
            <List className="h-5 w-5" />
          </button>
        </div>

        {/* Clear Filters Button (only show if no active filter text) */}
        {hasActiveFilters && !activeFilterText && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-1.5"
          >
            <span className="text-xs">Clear Filters</span>
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Mobile Layout - Three Rows */}
      <div className="md:hidden space-y-3">
        {/* Row 1: Event Type Pills - Horizontal Scrollable */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 pb-2 min-w-max">
            {categoryOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => onCategoryChange(value as typeof activeCategory)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-3 rounded-full",
                  "font-heading font-semibold text-sm transition-all duration-300",
                  "whitespace-nowrap min-h-[44px]",
                  activeCategory === value
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted text-muted-foreground"
                )}
                aria-label={`Show ${label.toLowerCase()}`}
                role="tab"
                aria-selected={activeCategory === value}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Program & Division Dropdowns - Full Width */}
        <div className="grid grid-cols-2 gap-3">
          <Select value={selectedProgram} onValueChange={handleProgramChange}>
            <SelectTrigger className="w-full h-11 rounded-2xl border-2" aria-label="Filter by Program">
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background">
              <SelectItem value="all">All</SelectItem>
              {availablePrograms.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.type === 'in_house' ? 'In-House' : 'Travel'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDivision} onValueChange={handleDivisionChange}>
            <SelectTrigger className="w-full h-11 rounded-2xl border-2" aria-label="Filter by Division">
              <SelectValue placeholder="Division" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background max-h-[300px]">
              <SelectItem value="all">All</SelectItem>
              {availableDivisions.map((division) => (
                <SelectItem key={division.id} value={division.id}>
                  {division.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 3: Team Dropdown - Full Width */}
        <div className="w-full">
          <Select value={selectedTeam} onValueChange={onTeamChange}>
            <SelectTrigger className="w-full h-11 rounded-2xl border-2" aria-label="Filter by Team">
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background max-h-[300px]">
              <SelectItem value="all">All Teams</SelectItem>
              {availableTeams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 4: View Toggle & Clear Filters */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => onViewModeChange('calendar')}
              className={cn(
                "p-3 rounded-lg transition-all duration-300 min-h-[44px] min-w-[44px]",
                viewMode === 'calendar'
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground"
              )}
              aria-label="Switch to Calendar View"
              aria-pressed={viewMode === 'calendar'}
            >
              <Calendar className="h-5 w-5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                "p-3 rounded-lg transition-all duration-300 min-h-[44px] min-w-[44px]",
                viewMode === 'list'
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground"
              )}
              aria-label="Switch to List View"
              aria-pressed={viewMode === 'list'}
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          {hasActiveFilters && !activeFilterText && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="gap-1.5 h-11"
            >
              <span className="text-xs">Clear</span>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};