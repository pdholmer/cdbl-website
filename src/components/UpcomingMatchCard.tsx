import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarEvent } from "@/data/calendarEvents";
import { MapPin, Clock, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { getEventCategoryImage } from "@/utils/eventImageHelper";
import { getFacilityLabel } from "@/utils/locationFormat";

interface UpcomingMatchCardProps {
  event: CalendarEvent;
  onViewDetails: (event: CalendarEvent) => void;
}

export const UpcomingMatchCard = ({ event, onViewDetails }: UpcomingMatchCardProps) => {
  const eventDate = parseISO(event.date);
  const categoryImage = getEventCategoryImage(event);
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'practice':
        return 'bg-event-practice text-white';
      case 'game':
        return 'bg-event-game text-white';
      case 'event':
        return 'bg-event-gold text-white';
      default:
        return 'bg-primary text-white';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className={`h-2 ${
        event.category === 'practice' ? 'bg-event-practice' :
        event.category === 'game' ? 'bg-event-game' :
        'bg-event-gold'
      }`} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${categoryImage.bgClass} flex items-center justify-center`}>
              <img 
                src={categoryImage.src} 
                alt={categoryImage.alt}
                className="h-12 w-12 object-contain"
                loading="lazy"
              />
            </div>
            <div>
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
        </div>

        <h3 className="text-xl font-heading font-bold mb-3 line-clamp-2">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          
          {event.time && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{event.time}</span>
            </div>
          )}
          
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{getFacilityLabel(event.location)}</span>
            </div>
          )}
        </div>

        <Button 
          onClick={() => onViewDetails(event)}
          className="w-full font-heading"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};
