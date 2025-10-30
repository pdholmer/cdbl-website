import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamFilterBannerProps {
  teamName: string;
  leagueType: string;
  onClear: () => void;
}

export const TeamFilterBanner = ({ teamName, leagueType, onClear }: TeamFilterBannerProps) => {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 flex items-center justify-between gap-4 animate-fade-in">
      <p className="text-sm font-medium text-foreground">
        Now viewing schedule for: <span className="text-primary font-bold">{teamName}</span>
        <span className="text-muted-foreground ml-1">({leagueType})</span>
      </p>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="h-8 gap-1.5 hover:bg-destructive/10 hover:text-destructive"
      >
        <span className="text-xs">Clear Filter</span>
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};
