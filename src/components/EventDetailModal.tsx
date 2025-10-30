import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarEvent } from "@/data/calendarEvents";
import { Calendar, MapPin, Clock, Download, Share2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { getEventCategoryImage } from "@/utils/eventImageHelper";
import { useTeamHierarchy } from "@/hooks/useTeamHierarchy";

interface EventDetailModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventDetailModal = ({ event, open, onOpenChange }: EventDetailModalProps) => {
  const { programs } = useTeamHierarchy();
  
  if (!event) return null;

  const eventDate = parseISO(event.date);
  const endDate = event.endDate ? parseISO(event.endDate) : null;
  const categoryImage = getEventCategoryImage(event, programs);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'event':
        return 'bg-event-gold text-white';
      case 'practice':
        return 'bg-event-practice text-white';
      case 'game':
        return 'bg-event-game text-white';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: `${event.title} - ${formatEventDate()}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `${event?.title} - ${formatEventDate()} - ${window.location.href}`;
      navigator.clipboard.writeText(shareText);
      toast.success('Event link copied to clipboard!');
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
            <div className={`p-3 rounded-lg ${categoryImage.bgClass} mt-1 flex items-center justify-center`}>
              <img 
                src={categoryImage.src} 
                alt={categoryImage.alt}
                className="h-14 w-14 object-contain"
                loading="lazy"
              />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-heading font-bold mb-2">
                {event.title}
              </DialogTitle>
              <Badge className={getCategoryColor(event.category)}>
                {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
              </Badge>
              {event.league && (
                <p className="text-xs text-muted-foreground mt-1">
                  {event.league === 'in-house' ? 'In-House' : event.league === 'travel' ? 'Travel' : 'League'}
                </p>
              )}
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
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <button
                  onClick={openInMaps}
                  className="text-left font-semibold hover:text-primary transition-colors hover:underline"
                >
                  {event.location}
                </button>
                <p className="text-sm text-muted-foreground">Tap to open in maps</p>
              </div>
            </div>
          )}

          {/* Description */}
          <DialogDescription className="text-base leading-relaxed pt-2">
            {event.description}
          </DialogDescription>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                // Placeholder for ICS export functionality
                console.log('Add to calendar:', event);
                toast.success('Calendar export coming soon!');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={() => onOpenChange(false)} className="col-span-2">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
