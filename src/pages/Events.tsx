import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarGrid } from "@/components/CalendarGrid";
import { EventDetailModal } from "@/components/EventDetailModal";
import { FeaturedEventsCarousel } from "@/components/FeaturedEventsCarousel";
import { calendarEvents, CalendarEvent } from "@/data/calendarEvents";
import { Calendar, Trophy, Users, Heart, HandHeart, DollarSign } from "lucide-react";
import heroImage from "@/assets/hero-events.jpg";

const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const filteredEvents = useMemo(() => {
    if (activeTab === "all") return calendarEvents;
    return calendarEvents.filter(event => event.category === activeTab);
  }, [activeTab]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const scrollToCalendar = () => {
    document.getElementById('calendar-section')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          className="relative py-16 md:py-24 text-primary-foreground overflow-hidden bg-cover bg-center sm:bg-center md:bg-[65%_center]"
          style={{
            backgroundImage: `linear-gradient(to right, hsla(217, 100%, 32%, 0.9) 0%, hsla(201, 63%, 56%, 0.1) 100%), url(${heroImage})`,
          }}
        >
          <div className="container relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 md:mb-6 leading-tight">
                CDBL Calendar
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 leading-relaxed opacity-95">
                Stay up to date on upcoming events, practices, and games across the Central District Baseball League.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={scrollToCalendar}
                  className="bg-white text-primary hover:bg-white/90 shadow-lg font-heading font-semibold"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  View Full Calendar
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    // Placeholder for sync functionality
                    console.log('Sync to device');
                  }}
                  className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-carolina hover:border-white font-heading font-semibold"
                >
                  Sync to Device
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Events Carousel */}
        <FeaturedEventsCarousel 
          events={calendarEvents}
          onEventClick={handleEventClick}
        />

        {/* Calendar Section */}
        <section id="calendar-section" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-12">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">All</span>
                </TabsTrigger>
                <TabsTrigger value="event" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Events</span>
                </TabsTrigger>
                <TabsTrigger value="practice" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Practices</span>
                </TabsTrigger>
                <TabsTrigger value="game" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span className="hidden sm:inline">Games</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                <CalendarGrid 
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                  onTodayClick={() => {
                    document.getElementById('calendar-section')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                />
              </TabsContent>
            </Tabs>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
              <div className="text-center p-6 rounded-xl bg-card border hover:shadow-lg transition-shadow">
                <div className="inline-flex p-3 rounded-full bg-event-gold/10 mb-3">
                  <Calendar className="h-8 w-8 text-event-gold" />
                </div>
                <p className="text-3xl font-heading font-bold mb-1">
                  {calendarEvents.filter(e => e.category === 'event').length}
                </p>
                <p className="text-muted-foreground font-sans">Total League Events</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-card border hover:shadow-lg transition-shadow">
                <div className="inline-flex p-3 rounded-full bg-event-practice/10 mb-3">
                  <Users className="h-8 w-8 text-event-practice" />
                </div>
                <p className="text-3xl font-heading font-bold mb-1">
                  {calendarEvents.filter(e => e.category === 'practice').length}
                </p>
                <p className="text-muted-foreground font-sans">Practice Sessions</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-card border hover:shadow-lg transition-shadow">
                <div className="inline-flex p-3 rounded-full bg-event-game/10 mb-3">
                  <Trophy className="h-8 w-8 text-event-game" />
                </div>
                <p className="text-3xl font-heading font-bold mb-1">
                  {calendarEvents.filter(e => e.category === 'game').length}
                </p>
                <p className="text-muted-foreground font-sans">Game Days</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stay in the Loop Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-heading font-bold mb-4">Stay in the Loop</h2>
            <p className="text-muted-foreground font-sans mb-8 max-w-2xl mx-auto">
              Follow us on social media for real-time updates, weather alerts, and schedule changes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" asChild className="font-heading">
                <a href="https://facebook.com/cdbl" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild className="font-heading">
                <a href="https://twitter.com/cdbl" target="_blank" rel="noopener noreferrer">
                  Twitter
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild className="font-heading">
                <a href="https://instagram.com/cdbl" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary-light text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-heading font-bold mb-4">Get Involved with CDBL</h2>
            <p className="text-lg mb-10 max-w-2xl mx-auto opacity-90">
              Join our community and help make a difference in youth baseball.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 font-heading"
                asChild
              >
                <a href="/volunteer">
                  <HandHeart className="mr-2 h-5 w-5" />
                  Volunteer
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white/20 font-heading"
                asChild
              >
                <a href="/donate">
                  <Heart className="mr-2 h-5 w-5" />
                  Donate
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white/20 font-heading"
                asChild
              >
                <a href="/registration">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Register
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Event Detail Modal */}
      <EventDetailModal 
        event={selectedEvent}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
};

export default Events;