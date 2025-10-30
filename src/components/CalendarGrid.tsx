import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/data/calendarEvents";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export const CalendarGrid = ({ events, onEventClick }: CalendarGridProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const calendarDays = useMemo(() => {
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDay = monthStart.getDay();
    const paddingDays = Array(startDay).fill(null);
    return [...paddingDays, ...days];
  }, [monthStart, monthEnd]);

  const eventsForDay = (day: Date | null) => {
    if (!day) return [];
    return events.filter(event => {
      const eventStart = parseISO(event.date);
      const eventEnd = event.endDate ? parseISO(event.endDate) : eventStart;
      return day >= eventStart && day <= eventEnd;
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'event':
        return 'bg-primary';
      case 'practice':
        return 'bg-green-500';
      case 'game':
        return 'bg-orange-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6 px-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="h-10 w-10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h2 className="text-3xl font-bold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="h-10 w-10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2 px-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 px-4">
        {calendarDays.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dayEvents = eventsForDay(day);
          const hasEvents = dayEvents.length > 0;
          const isCurrentDay = isToday(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={day.toISOString()}
              onClick={() => {
                if (dayEvents.length === 1) {
                  onEventClick(dayEvents[0]);
                } else if (dayEvents.length > 1) {
                  onEventClick(dayEvents[0]); // Show first event, could enhance to show list
                }
              }}
              disabled={!hasEvents}
              className={cn(
                "aspect-square p-2 rounded-lg border transition-all duration-200",
                "flex flex-col items-start justify-start",
                isCurrentDay && "border-primary border-2 bg-primary/5",
                !isCurrentMonth && "opacity-40",
                hasEvents && "hover:shadow-lg hover:scale-105 cursor-pointer bg-card",
                !hasEvents && "cursor-default"
              )}
            >
              <span className={cn(
                "text-sm font-semibold mb-1",
                isCurrentDay && "text-primary"
              )}>
                {format(day, 'd')}
              </span>
              
              {/* Event Indicators */}
              {hasEvents && (
                <div className="flex flex-wrap gap-1 w-full">
                  {dayEvents.slice(0, 3).map((event, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "h-1.5 flex-1 rounded-full",
                        getCategoryColor(event.category)
                      )}
                      title={event.title}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 px-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">Practices</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-orange-500" />
          <span className="text-sm text-muted-foreground">Games</span>
        </div>
      </div>
    </div>
  );
};
