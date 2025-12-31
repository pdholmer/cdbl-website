import { Link } from "react-router-dom";
import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Game {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
}

interface UpcomingGamesCardProps {
  games: Game[];
  isLoading?: boolean;
}

function formatGameDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEE, MMM d");
}

function formatGameTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function UpcomingGamesCard({ games, isLoading = false }: UpcomingGamesCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="divide-y">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden backdrop-blur-sm bg-card/80">
      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Upcoming Games</h3>
        </div>
        <Link
          to="/admin/schedule"
          className="text-xs font-medium text-primary hover:underline flex items-center"
        >
          View All
          <ChevronRight className="h-3 w-3 ml-0.5" />
        </Link>
      </div>

      {games.length === 0 ? (
        <div className="p-8 text-center">
          <Calendar className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No upcoming games scheduled</p>
        </div>
      ) : (
        <div className="divide-y max-h-[320px] overflow-y-auto">
          {games.map((game) => (
            <Link
              key={game.id}
              to={`/admin/schedule`}
              className="block p-4 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {game.homeTeam} vs {game.awayTeam}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                    <span className={cn(
                      "font-medium",
                      isToday(parseISO(game.date)) && "text-primary"
                    )}>
                      {formatGameDate(game.date)}
                    </span>
                    <span>•</span>
                    <span>{formatGameTime(game.time)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{game.venue}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
