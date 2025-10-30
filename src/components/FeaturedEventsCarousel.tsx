import { CalendarEvent } from "@/data/calendarEvents";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface FeaturedEventsCarouselProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export const FeaturedEventsCarousel = ({ events, onEventClick }: FeaturedEventsCarouselProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'event':
        return 'bg-event-gold text-white';
      case 'practice':
        return 'bg-event-practice text-white';
      case 'game':
        return 'bg-event-game text-white';
      default:
        return 'bg-primary text-white';
    }
  };

  return (
    <div className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-heading font-bold mb-8 text-center">Featured Events</h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {events.slice(0, 6).map((event) => {
              const eventDate = parseISO(event.date);
              const Icon = event.icon;
              
              return (
                <CarouselItem key={event.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
                    <div className={`h-32 flex items-center justify-center ${getCategoryColor(event.category)}`}>
                      <Icon className="h-16 w-16 opacity-80" />
                    </div>
                    <CardContent className="p-6 flex flex-col h-[calc(100%-8rem)]">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(eventDate, 'MMMM d, yyyy')}</span>
                      </div>
                      <h3 className="font-heading font-bold text-xl mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      {event.location && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{event.location}</span>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow">
                        {event.description}
                      </p>
                      <Button 
                        onClick={() => onEventClick(event)}
                        variant="outline"
                        className="w-full mt-auto"
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </div>
  );
};
