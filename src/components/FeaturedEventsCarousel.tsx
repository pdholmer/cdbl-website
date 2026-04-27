import { CalendarEvent } from "@/data/calendarEvents";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { getEventCategoryImage, getGameMatchupDisplay } from "@/utils/eventImageHelper";
import { getFacilityLabel } from "@/utils/locationFormat";
import { useTeamHierarchy } from "@/hooks/useTeamHierarchy";
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
  const { programs, getAllTeams } = useTeamHierarchy();
  const allTeams = getAllTeams();
  
  const renderCardHeader = (event: CalendarEvent) => {
    const matchup = getGameMatchupDisplay(event, allTeams, programs);
    
    if (matchup.isMatchup) {
      return (
        <div className="h-32 bg-gradient-to-r from-muted via-background to-muted flex items-center justify-between px-6">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className={`p-2 rounded-lg ${matchup.homeImage.bgClass} flex items-center justify-center`}>
              <img 
                src={matchup.homeImage.src}
                alt={matchup.homeImage.alt}
                className="h-12 w-12 object-contain"
                loading="lazy"
              />
            </div>
            <span className="text-xs font-semibold text-center line-clamp-2">
              {matchup.homeTeam?.name}
            </span>
          </div>
          
          <div className="flex items-center justify-center px-4">
            <span className="text-2xl font-heading font-bold text-muted-foreground">VS</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className={`p-2 rounded-lg ${matchup.awayImage.bgClass} flex items-center justify-center`}>
              <img 
                src={matchup.awayImage.src}
                alt={matchup.awayImage.alt}
                className="h-12 w-12 object-contain"
                loading="lazy"
              />
            </div>
            <span className="text-xs font-semibold text-center line-clamp-2">
              {matchup.awayTeam?.name}
            </span>
          </div>
        </div>
      );
    }
    
    const categoryImage = getEventCategoryImage(event, programs);
    
    return (
      <div className={`h-32 flex items-center justify-center ${categoryImage.bgClass}`}>
        <img 
          src={categoryImage.src}
          alt={categoryImage.alt}
          className="h-20 w-20 object-contain"
          loading="lazy"
        />
      </div>
    );
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
              
              return (
                <CarouselItem key={event.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
                    {renderCardHeader(event)}
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
