import { CalendarEvent } from "@/data/calendarEvents";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { MapPin } from "lucide-react";

interface DivisionScheduleTableProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export const DivisionScheduleTable = ({ events, onEventClick }: DivisionScheduleTableProps) => {
  const getCategoryChip = (category: string) => {
    switch (category) {
      case 'practice':
        return <Badge className="bg-event-practice text-white">Practice</Badge>;
      case 'game':
        return <Badge className="bg-event-game text-white">Game</Badge>;
      case 'event':
        return <Badge className="bg-event-gold text-white">Event</Badge>;
      default:
        return <Badge>Other</Badge>;
    }
  };

  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No scheduled events for this division yet.</p>
      </Card>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-heading font-semibold">Date</th>
              <th className="text-left py-3 px-4 font-heading font-semibold">Time</th>
              <th className="text-left py-3 px-4 font-heading font-semibold">Event</th>
              <th className="text-left py-3 px-4 font-heading font-semibold">Location</th>
              <th className="text-left py-3 px-4 font-heading font-semibold">Type</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const eventDate = parseISO(event.date);
              return (
                <tr
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-medium">
                    {format(eventDate, 'MMM d')}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {event.time || '--'}
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {event.title}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{event.location || 'TBD'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getCategoryChip(event.category)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {events.map((event) => {
          const eventDate = parseISO(event.date);
          const Icon = event.icon;
          
          return (
            <Card
              key={event.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
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
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {format(eventDate, 'MMM d')}
                    </Badge>
                    {getCategoryChip(event.category)}
                  </div>
                  <h3 className="font-heading font-semibold mb-1 line-clamp-1">
                    {event.title}
                  </h3>
                  {event.time && (
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                  )}
                  {event.location && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
};
