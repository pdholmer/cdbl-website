import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarEvent } from "@/data/calendarEvents";
import { Calendar, MapPin, Clock, Download } from "lucide-react";
import { format, parseISO } from "date-fns";

interface EventDetailModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventDetailModal = ({ event, open, onOpenChange }: EventDetailModalProps) => {
  if (!event) return null;

  const eventDate = parseISO(event.date);
  const endDate = event.endDate ? parseISO(event.endDate) : null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'event':
        return 'bg-primary text-primary-foreground';
      case 'practice':
        return 'bg-green-500 text-white';
      case 'game':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const formatEventDate = () => {
    if (endDate && eventDate.getTime() !== endDate.getTime()) {
      return `${format(eventDate, 'MMMM d')} - ${format(endDate, 'MMMM d, yyyy')}`;
    }
    return format(eventDate, 'MMMM d, yyyy');
  };

  const openInMaps = () => {
    if (event.location) {
      const query = encodeURIComponent(event.location);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 mt-1">
              <event.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold mb-2">
                {event.title}
              </DialogTitle>
              <Badge className={getCategoryColor(event.category)}>
                {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-semibold">{formatEventDate()}</p>
              {event.time && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {event.time}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <button
                  onClick={openInMaps}
                  className="text-left font-semibold hover:text-primary transition-colors"
                >
                  {event.location}
                </button>
                <p className="text-sm text-muted-foreground">Click to view in maps</p>
              </div>
            </div>
          )}

          {/* Description */}
          <DialogDescription className="text-base leading-relaxed pt-2">
            {event.description}
          </DialogDescription>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                // Placeholder for ICS export functionality
                console.log('Add to calendar:', event);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
            <Button onClick={() => onOpenChange(false)} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
