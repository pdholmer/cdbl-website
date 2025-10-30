import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpcomingMatchCard } from "@/components/UpcomingMatchCard";
import { DivisionScheduleTable } from "@/components/DivisionScheduleTable";
import { EventDetailModal } from "@/components/EventDetailModal";
import { CalendarGrid } from "@/components/CalendarGrid";
import { FeaturedEventsCarousel } from "@/components/FeaturedEventsCarousel";
import { FindMyTeamModal } from "@/components/FindMyTeamModal";
import { UnifiedScheduleToolbar } from "@/components/UnifiedScheduleToolbar";
import { calendarEvents, CalendarEvent } from "@/data/calendarEvents";
import { teamData, getTeamsByLeague } from "@/data/teamData";
import { Calendar, MapPin, Users, HandHeart, ExternalLink, Filter, Trophy, List, UsersRound } from "lucide-react";
import { isAfter, parseISO, startOfToday } from "date-fns";
import heroImage from "@/assets/hero-schedule.jpg";

const Schedule = () => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<'in-house' | 'travel' | null>(null);
  const [leagueFilter, setLeagueFilter] = useState<'in-house' | 'travel' | 'all'>('all');
  const [teamFilter, setTeamFilter] = useState<string | 'all'>('all');

  // Get upcoming events (future events only)
  const upcomingEvents = useMemo(() => {
    const today = startOfToday();
    return calendarEvents
      .filter(event => {
        const eventDate = parseISO(event.date);
        return isAfter(eventDate, today) || eventDate.toDateString() === today.toDateString();
      })
      .sort((a, b) => {
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  }, []);

  // Dynamic team list based on league filter
  const availableTeams = useMemo(() => {
    if (leagueFilter === 'all') {
      return teamData;
    }
    return getTeamsByLeague(leagueFilter);
  }, [leagueFilter]);

  // Filter events by category, league, and team
  const filteredEvents = useMemo(() => {
    let events = calendarEvents;
    
    // Filter by category tab
    if (activeTab !== "all") {
      events = events.filter(event => event.category === activeTab);
    }
    
    // Filter by league
    if (leagueFilter !== 'all') {
      events = events.filter(event => 
        !event.league || // Show events without league specified
        event.league === leagueFilter ||
        event.league === 'both' // Show league-wide events
      );
    }
    
    // Filter by team
    if (teamFilter !== 'all') {
      events = events.filter(event => 
        !event.team || // Show events without team specified
        event.team === teamFilter ||
        event.homeTeam === teamFilter ||
        event.awayTeam === teamFilter
      );
    }
    
    // Legacy "Find My Team" filter (maintain backward compatibility)
    if (selectedTeamId && selectedTeamName) {
      events = events.filter(event => 
        event.team === selectedTeamId ||
        event.homeTeam === selectedTeamId ||
        event.awayTeam === selectedTeamId ||
        event.title.toLowerCase().includes(selectedTeamName.toLowerCase()) ||
        event.location?.toLowerCase().includes(selectedTeamName.toLowerCase()) ||
        event.description?.toLowerCase().includes(selectedTeamName.toLowerCase())
      );
    }
    
    return events;
  }, [activeTab, leagueFilter, teamFilter, selectedTeamId, selectedTeamName]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleTeamSelected = (teamId: string, teamName: string, league: 'in-house' | 'travel') => {
    // Update all filter states to match selection
    setLeagueFilter(league);
    setTeamFilter(teamId);
    setActiveTab('all');
    setSelectedTeamId(teamId);
    setSelectedTeamName(teamName);
    setSelectedLeague(league);
  };

  const handleClearAllFilters = () => {
    setActiveTab('all');
    setLeagueFilter('all');
    setTeamFilter('all');
    setSelectedTeamId(null);
    setSelectedTeamName(null);
    setSelectedLeague(null);
  };

  const handleLeagueChange = (league: 'in-house' | 'travel' | 'all') => {
    setLeagueFilter(league);
    
    // If current team doesn't belong to new league, reset team filter
    if (teamFilter !== 'all') {
      const newTeams = league === 'all' ? teamData : getTeamsByLeague(league);
      const teamExists = newTeams.some(t => t.id === teamFilter);
      if (!teamExists) {
        setTeamFilter('all');
      }
    }
  };

  const hasActiveFilters = useMemo(() => {
    return leagueFilter !== 'all' || 
           teamFilter !== 'all' || 
           selectedTeamId !== null;
  }, [leagueFilter, teamFilter, selectedTeamId]);

  const scrollToSchedule = () => {
    const scheduleSection = document.getElementById('schedule-section');
    if (scheduleSection) {
      scheduleSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Add focus for accessibility
      setTimeout(() => {
        scheduleSection.setAttribute('tabindex', '-1');
        scheduleSection.focus({ preventScroll: true });
        
        // Add highlight animation
        scheduleSection.classList.add('highlight-pulse');
        setTimeout(() => {
          scheduleSection.classList.remove('highlight-pulse');
        }, 2000);
      }, 600);
    }
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
                League Schedule
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 leading-relaxed opacity-95">
                Your one-stop view of practices, games, and league events.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={() => setTeamModalOpen(true)}
                  className="bg-white text-primary hover:bg-white/90 shadow-lg font-heading font-semibold hover:scale-105 transition-all"
                >
                  <UsersRound className="mr-2 h-5 w-5" />
                  Find My Team
                </Button>
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={scrollToSchedule}
                  className="bg-white text-primary hover:bg-white/90 shadow-lg font-heading font-semibold"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  View Calendar
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  asChild
                  className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-carolina hover:border-white font-heading font-semibold"
                >
                  <Link to="/fields">View Fields</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Upcoming Section */}
        <FeaturedEventsCarousel 
          events={calendarEvents}
          onEventClick={handleEventClick}
        />

        {/* Interactive Schedule Section */}
        <section id="schedule-section" className="py-12 md:py-16 bg-background" tabIndex={-1}>
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Interactive Schedule</h2>
              
              {/* Unified Filter Toolbar */}
              <UnifiedScheduleToolbar
                activeCategory={activeTab as 'all' | 'event' | 'practice' | 'game'}
                onCategoryChange={(category) => setActiveTab(category)}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                selectedLeague={leagueFilter}
                onLeagueChange={handleLeagueChange}
                selectedTeam={teamFilter}
                onTeamChange={setTeamFilter}
                availableTeams={availableTeams}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={handleClearAllFilters}
                activeFilterText={
                  selectedTeamName 
                    ? `${selectedTeamName} (${selectedLeague === 'in-house' ? 'In-House' : 'Travel'} League)`
                    : undefined
                }
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

              <TabsContent value={activeTab} className="mt-0">
                {viewMode === "calendar" ? (
                  <div className="hidden md:block">
                    <CalendarGrid 
                      events={filteredEvents}
                      onEventClick={handleEventClick}
                    />
                  </div>
                ) : null}
                
                {viewMode === "list" || viewMode === "calendar" ? (
                  <div className={viewMode === "calendar" ? "md:hidden" : ""}>
                    {filteredEvents.length === 0 ? (
                      <Card className="p-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <Calendar className="h-16 w-16 text-muted-foreground/50" />
                          <div>
                            <h3 className="text-xl font-semibold mb-2">
                              {hasActiveFilters 
                                ? "No events match your filters"
                                : "No upcoming events scheduled"
                              }
                            </h3>
                            <p className="text-muted-foreground mb-4">
                              {hasActiveFilters
                                ? "Try adjusting your league, team, or event type filters"
                                : "Check back soon for the latest schedule updates"
                              }
                            </p>
                            {hasActiveFilters && (
                              <Button variant="outline" onClick={handleClearAllFilters}>
                                Clear All Filters
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <DivisionScheduleTable 
                        events={filteredEvents}
                        onEventClick={handleEventClick}
                      />
                    )}
                  </div>
                ) : null}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* League Stats Summary */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 md:mb-12 text-center">League Activity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="inline-flex p-3 rounded-full bg-event-game/10 mb-3 animate-pulse">
                    <Trophy className="h-8 w-8 text-event-game" />
                  </div>
                  <p className="text-3xl md:text-4xl font-heading font-bold mb-1">
                    {calendarEvents.filter(e => e.category === 'game').length}
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground font-sans">Total Games</p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="inline-flex p-3 rounded-full bg-event-practice/10 mb-3 animate-pulse" style={{ animationDelay: '0.2s' }}>
                    <Users className="h-8 w-8 text-event-practice" />
                  </div>
                  <p className="text-3xl md:text-4xl font-heading font-bold mb-1">
                    {calendarEvents.filter(e => e.category === 'practice').length}
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground font-sans">Practice Sessions</p>
                </CardContent>
              </Card>
              <Card className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="inline-flex p-3 rounded-full bg-event-gold/10 mb-3 animate-pulse" style={{ animationDelay: '0.4s' }}>
                    <Calendar className="h-8 w-8 text-event-gold" />
                  </div>
                  <p className="text-3xl md:text-4xl font-heading font-bold mb-1">
                    {calendarEvents.filter(e => e.category === 'event').length}
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground font-sans">League Events</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Important Dates Section */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8 md:mb-12 text-center">Important Dates - 2026 Season</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
              {[
                { date: "Dec 1, 2025", title: "Registration Opens", desc: "Early bird registration begins" },
                { date: "Mar 8-9, 2026", title: "Player Evaluations", desc: "Skill assessments for team placement" },
                { date: "Mar 15, 2026", title: "Draft Day", desc: "Team rosters finalized" },
                { date: "Apr 12, 2026", title: "Opening Day", desc: "Season kicks off with ceremony" },
                { date: "Jun 20, 2026", title: "All-Star Game", desc: "Annual all-star showcase" },
                { date: "Jul 18, 2026", title: "Championship Day", desc: "Season finale tournaments" }
              ].map((item, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-xl md:text-2xl font-heading font-bold text-primary mb-2">{item.date}</p>
                    <h3 className="font-heading font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground font-sans">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-primary to-primary-light text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">Access Your Team Schedule</h2>
              <p className="text-base md:text-xl max-w-2xl mx-auto opacity-95 font-sans leading-relaxed">
                View complete schedules, game results, and standings on SportsConnect once the season begins.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="inline-flex p-4 rounded-full bg-white/20 mb-4">
                    <ExternalLink className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-3 text-white">SportsConnect</h3>
                  <p className="text-white/90 mb-6 font-sans">
                    Access team schedules, standings, and game results in real-time.
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-primary hover:bg-white/90 font-heading font-semibold"
                    onClick={() => window.open('https://leagues.bluesombrero.com/Default.aspx?tabid=2121019', '_blank')}
                  >
                    Open SportsConnect
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="inline-flex p-4 rounded-full bg-white/20 mb-4">
                    <MapPin className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-3 text-white">Fields & Maps</h3>
                  <p className="text-white/90 mb-6 font-sans">
                    Find field locations, directions, and parking information.
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-primary hover:bg-white/90 font-heading font-semibold"
                    asChild
                  >
                    <Link to="/fields">View All Fields</Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="inline-flex p-4 rounded-full bg-white/20 mb-4">
                    <HandHeart className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-3 text-white">Volunteer</h3>
                  <p className="text-white/90 mb-6 font-sans">
                    Help make game day special by volunteering for various roles.
                  </p>
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-primary hover:bg-white/90 font-heading font-semibold"
                    asChild
                  >
                    <Link to="/volunteer">Get Involved</Link>
                  </Button>
                </CardContent>
              </Card>
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
      
      {/* Find My Team Modal */}
      <FindMyTeamModal
        open={teamModalOpen}
        onOpenChange={setTeamModalOpen}
        onTeamSelected={handleTeamSelected}
        onScrollToSchedule={scrollToSchedule}
      />
    </div>
  );
};

export default Schedule;
