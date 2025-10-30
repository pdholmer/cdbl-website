import { CalendarEvent } from "@/data/calendarEvents";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface CalendarGridProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onTodayClick?: () => void;
}

export const CalendarGrid = ({ events, onEventClick, onTodayClick }: CalendarGridProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayEvents = (day: Date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.date);
      const endDate = event.endDate ? parseISO(event.endDate) : eventDate;
      return day >= eventDate && day <= endDate;
    });
  };

  const getEventDotColor = (category: string) => {
    switch (category) {
      case 'practice':
        return 'bg-event-practice';
      case 'game':
        return 'bg-event-game';
      case 'event':
        return 'bg-event-gold';
      default:
        return 'bg-primary';
    }
  };

  const handleTodayClick = () => {
    setCurrentMonth(new Date());
    if (onTodayClick) {
      onTodayClick();
    }
  };

  return (
    <div className="w-full">
      {/* Month Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-heading font-bold min-w-[200px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <Button
          variant="default"
          onClick={handleTodayClick}
          className="min-w-[100px] font-heading"
        >
          Today
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center font-heading font-semibold text-sm text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, idx) => {
          const dayEvents = getDayEvents(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);
          const hasEvents = dayEvents.length > 0;

          return (
            <Card
              key={idx}
              className={`
                min-h-[100px] p-2 transition-all
                ${isCurrentMonth ? 'opacity-100' : 'opacity-40'}
                ${isCurrentDay ? 'ring-2 ring-primary bg-primary/5' : ''}
                ${hasEvents ? 'cursor-pointer hover:shadow-lg hover:scale-105' : 'cursor-default'}
              `}
              onClick={() => hasEvents && dayEvents[0] && onEventClick(dayEvents[0])}
            >
              <div className="flex flex-col h-full">
                <div className={`text-right text-sm font-semibold mb-2 ${isCurrentDay ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </div>
                {hasEvents && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-1">
                    {/* Color-coded dots for event types */}
                    <div className="flex gap-1 flex-wrap justify-center">
                      {Array.from(new Set(dayEvents.map(e => e.category))).map((category, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${getEventDotColor(category)}`}
                          title={category}
                        />
                      ))}
                    </div>
                    {/* Event count badge */}
                    {dayEvents.length > 0 && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap gap-6 justify-center items-center">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-event-practice" />
          <span className="text-sm font-medium font-sans">Practices</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-event-game" />
          <span className="text-sm font-medium font-sans">Games</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-event-gold" />
          <span className="text-sm font-medium font-sans">Events</span>
        </div>
      </div>
    </div>
  );
};
