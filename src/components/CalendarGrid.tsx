import { CalendarEvent } from "@/data/calendarEvents";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, isToday, parseISO, isBefore } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface CalendarGridProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export const CalendarGrid = ({ events, onEventClick }: CalendarGridProps) => {
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

  // Get events for list view (current month)
  const monthEvents = events.filter(event => {
    const eventDate = parseISO(event.date);
    return isSameMonth(eventDate, currentMonth);
  }).sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="w-full">
      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-2 mb-8">
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

      {/* Grid View - Desktop/Tablet Only */}
      <>
        {/* Weekday Headers */}
        <div className="hidden md:grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center font-heading font-semibold text-sm text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

          {/* Calendar Days - Desktop/Tablet */}
          <div className="hidden md:grid grid-cols-7 gap-3">
            {calendarDays.map((day, idx) => {
              const dayEvents = getDayEvents(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);
              const hasEvents = dayEvents.length > 0;
              const maxVisibleEvents = 3;
              const visibleEvents = dayEvents.slice(0, maxVisibleEvents);
              const remainingCount = dayEvents.length - maxVisibleEvents;

              return (
                <Card
                  key={idx}
                  className={`
                    min-h-[120px] p-2 transition-all overflow-hidden
                    ${isCurrentMonth ? 'opacity-100' : 'opacity-40'}
                    ${isCurrentDay ? 'ring-2 ring-primary bg-primary/5' : 'bg-card'}
                    ${hasEvents ? 'hover:shadow-lg hover:border-primary/50' : ''}
                  `}
                >
                  <div className="flex flex-col h-full gap-1">
                    {/* Day number */}
                    <div className={`text-sm font-semibold ${
                      isCurrentDay 
                        ? 'bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center' 
                        : 'text-muted-foreground'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    
                    {/* Event list */}
                    {hasEvents && (
                      <div className="flex-1 space-y-1 overflow-hidden">
                        {visibleEvents.map((event, eventIdx) => (
                          <button
                            key={eventIdx}
                            onClick={() => onEventClick(event)}
                            className={`
                              w-full text-left px-1.5 py-1 rounded text-xs
                              transition-colors hover:brightness-90
                              ${
                                event.category === 'event' 
                                  ? 'bg-event-gold text-white' 
                                  : event.category === 'practice'
                                  ? 'bg-event-practice text-white'
                                  : 'bg-event-game text-white'
                              }
                            `}
                          >
                            <div className="flex items-center gap-1">
                              {event.time && (
                                <span className="font-medium opacity-90 text-[10px]">
                                  {event.time.split(' ')[0]}
                                </span>
                              )}
                              <span className="truncate font-medium">
                                {event.title}
                              </span>
                            </div>
                          </button>
                        ))}
                        
                        {/* "X more" indicator */}
                        {remainingCount > 0 && (
                          <button
                            onClick={() => dayEvents[maxVisibleEvents] && onEventClick(dayEvents[maxVisibleEvents])}
                            className="w-full text-left px-1.5 py-1 text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
                          >
                            +{remainingCount} more
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>

      {/* List View - Mobile Only */}
      <div className="md:hidden space-y-3">
          {monthEvents.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No events this month</p>
            </Card>
          ) : (
            monthEvents.map((event) => {
              const eventDate = parseISO(event.date);
              const Icon = event.icon;
              const isPast = isBefore(eventDate, new Date()) && !isToday(eventDate);
              
              return (
                <Card
                  key={event.id}
                  className={`p-4 transition-all hover:shadow-lg ${isPast ? 'opacity-60' : ''}`}
                  onClick={() => onEventClick(event)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      event.category === 'event' ? 'bg-event-gold/10' :
                      event.category === 'practice' ? 'bg-event-practice/10' :
                      'bg-event-game/10'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        event.category === 'event' ? 'text-event-gold' :
                        event.category === 'practice' ? 'text-event-practice' :
                        'text-event-game'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {format(eventDate, 'MMM d')}
                        </Badge>
                        {event.time && (
                          <span className="text-xs text-muted-foreground">{event.time}</span>
                        )}
                      </div>
                      <h3 className="font-heading font-semibold mb-1 line-clamp-1">
                        {event.title}
                      </h3>
                      {event.location && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {getFacilityLabel(event.location)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
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
