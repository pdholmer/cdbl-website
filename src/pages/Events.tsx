import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarGrid } from "@/components/CalendarGrid";
import { EventDetailModal } from "@/components/EventDetailModal";
import { calendarEvents, CalendarEvent } from "@/data/calendarEvents";
import { Calendar, Trophy, Users } from "lucide-react";
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
          className="relative h-[500px] flex items-center justify-center text-white"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(1, 56, 130, 0.9), rgba(75, 156, 211, 0.9)), url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              CDBL Calendar
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Stay up to date on upcoming events, practices, and games across the Central District Baseball League.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={scrollToCalendar}
                className="bg-white text-primary hover:bg-white/90"
              >
                <Calendar className="mr-2 h-5 w-5" />
                View Full Calendar
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-white hover:bg-white/20"
                onClick={() => {
                  // Placeholder for sync functionality
                  console.log('Sync to device');
                }}
              >
                Sync to Device
              </Button>
            </div>
          </div>
        </section>

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
                />
              </TabsContent>
            </Tabs>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
              <div className="text-center p-6 rounded-xl bg-card border">
                <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <p className="text-3xl font-bold mb-1">
                  {calendarEvents.filter(e => e.category === 'event').length}
                </p>
                <p className="text-muted-foreground">League Events</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-card border">
                <div className="inline-flex p-3 rounded-full bg-green-500/10 mb-3">
                  <Users className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-3xl font-bold mb-1">
                  {calendarEvents.filter(e => e.category === 'practice').length}
                </p>
                <p className="text-muted-foreground">Practice Sessions</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-card border">
                <div className="inline-flex p-3 rounded-full bg-orange-500/10 mb-3">
                  <Trophy className="h-8 w-8 text-orange-500" />
                </div>
                <p className="text-3xl font-bold mb-1">
                  {calendarEvents.filter(e => e.category === 'game').length}
                </p>
                <p className="text-muted-foreground">Game Days</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stay in the Loop Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Follow us on social media for real-time updates, weather alerts, and schedule changes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" asChild>
                <a href="https://facebook.com/cdbl" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="https://twitter.com/cdbl" target="_blank" rel="noopener noreferrer">
                  Twitter
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="https://instagram.com/cdbl" target="_blank" rel="noopener noreferrer">
                  Instagram
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