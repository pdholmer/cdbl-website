import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
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
import { CalendarEvent } from "@/data/calendarEvents";
import { useScheduleEvents } from "@/hooks/useScheduleEvents";
import { useTeamHierarchy } from "@/hooks/useTeamHierarchy";
import { Calendar, MapPin, Users, HandHeart, ExternalLink, Filter, Trophy, List, UsersRound, History, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isAfter, parseISO, startOfToday, isBefore } from "date-fns";
import heroImage from "@/assets/hero-schedule.jpg";

const Schedule = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data } = await supabase.rpc('has_role', { _user_id: session.user.id, _role: 'admin' });
      if (data) { setIsAdmin(true); return; }
      const { data: bm } = await supabase.rpc('has_role', { _user_id: session.user.id, _role: 'board_member' });
      if (bm) setIsAdmin(true);
    };
    checkRole();
  }, []);

  // State management for modals and UI
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [showPast, setShowPast] = useState(false);

  // Dynamic events from database + static
  const { events: allEvents, isLoading: eventsLoading } = useScheduleEvents();
  
  // Filter state - Program > Division > Team hierarchy
  const [programFilter, setProgramFilter] = useState<string | 'all'>('all');
  const [divisionFilter, setDivisionFilter] = useState<string | 'all'>('all');
  const [teamFilter, setTeamFilter] = useState<string | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState<string | 'all'>('all');

  // Get hierarchical team data
  const { 
    programs, 
    getDivisionsByProgram, 
    getTeamsByDivision,
    getAllTeams 
  } = useTeamHierarchy();

  // Get upcoming events (future events only)
  const upcomingEvents = useMemo(() => {
    const today = startOfToday();
    return allEvents
      .filter(event => {
        const eventDate = parseISO(event.date);
        return isAfter(eventDate, today) || eventDate.toDateString() === today.toDateString();
      })
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 6);
  }, [allEvents]);

  // Dynamic divisions based on program filter
  const availableDivisions = useMemo(() => {
    if (programFilter === 'all') {
      return programs?.flatMap(p => p.divisions || []) || [];
    }
    return getDivisionsByProgram(programFilter);
  }, [programFilter, programs, getDivisionsByProgram]);

  // Dynamic teams based on division filter
  const availableTeams = useMemo(() => {
    if (divisionFilter === 'all') {
      return availableDivisions.flatMap(d => d.teams || []);
    }
    return getTeamsByDivision(divisionFilter);
  }, [divisionFilter, availableDivisions, getTeamsByDivision]);

  // Filter events by category, program, division, and team
  const filteredEvents = useMemo(() => {
    const today = startOfToday();
    let events = allEvents;
    
    // Default: show upcoming only unless showPast is toggled
    if (!showPast) {
      events = events.filter(event => {
        const eventDate = parseISO(event.date);
        return isAfter(eventDate, today) || eventDate.toDateString() === today.toDateString();
      });
    }
    
    // Filter by category tab
    if (activeTab !== "all") {
      events = events.filter(event => event.category === activeTab);
    }
    
    // Filter by program
    if (programFilter !== 'all') {
      events = events.filter(event => 
        !event.programId || event.programId === programFilter
      );
    }
    
    // Filter by division
    if (divisionFilter !== 'all') {
      events = events.filter(event => 
        !event.divisionId || event.divisionId === divisionFilter
      );
    }
    
    // Filter by team
    if (teamFilter !== 'all') {
      events = events.filter(event => 
        !event.teamId ||
        event.teamId === teamFilter ||
        event.homeTeamId === teamFilter ||
        event.awayTeamId === teamFilter
      );
    }
    
    // Sort by date
    return events.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [allEvents, activeTab, programFilter, divisionFilter, teamFilter, showPast]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleTeamSelected = (teamId: string, teamName: string, divisionId: string, programId: string) => {
    // Update all filter states to match selection
    setProgramFilter(programId);
    setDivisionFilter(divisionId);
    setTeamFilter(teamId);
    setActiveTab('all');
  };

  const handleClearAllFilters = () => {
    setActiveTab('all');
    setProgramFilter('all');
    setDivisionFilter('all');
    setTeamFilter('all');
  };

  const handleProgramChange = (programId: string | 'all') => {
    setProgramFilter(programId);
    setDivisionFilter('all');
    setTeamFilter('all');
  };

  const handleDivisionChange = (divisionId: string | 'all') => {
    setDivisionFilter(divisionId);
    setTeamFilter('all');
  };

  const hasActiveFilters = useMemo(() => {
    return programFilter !== 'all' || 
           divisionFilter !== 'all' || 
           teamFilter !== 'all';
  }, [programFilter, divisionFilter, teamFilter]);

  const activeFilterText = useMemo(() => {
    const parts: string[] = [];
    
    if (programFilter !== 'all') {
      const program = programs?.find(p => p.id === programFilter);
      if (program) parts.push(program.name);
    }
    
    if (divisionFilter !== 'all') {
      const division = availableDivisions.find(d => d.id === divisionFilter);
      if (division) parts.push(division.name);
    }
    
    if (teamFilter !== 'all') {
      const team = availableTeams.find(t => t.id === teamFilter);
      if (team) parts.push(team.name);
    }
    
    if (activeTab !== 'all') {
      parts.push(activeTab + 's');
    }
    
    return parts.length > 0 ? parts.join(' → ') : undefined;
  }, [programFilter, divisionFilter, teamFilter, activeTab, programs, availableDivisions, availableTeams]);

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
            backgroundImage: `linear-gradient(to right, hsla(215, 100%, 26%, 0.9) 0%, hsla(201, 63%, 56%, 0.1) 100%), url(${heroImage})`,
          }}
        >
          <div className="container relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight line-clamp-1">
                League Schedule
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 leading-relaxed opacity-95 line-clamp-2">
                Your one-stop view of practices, games, and league events.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={() => setTeamModalOpen(true)}
                  className="bg-white text-primary hover:bg-white/90 shadow-lg font-semibold"
                >
                  <UsersRound className="mr-2 h-5 w-5" />
                  Find My Team
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={scrollToSchedule}
                  className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-carolina hover:border-white font-semibold"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  View Calendar
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Upcoming Section */}
        <FeaturedEventsCarousel 
          events={upcomingEvents}
          onEventClick={handleEventClick}
        />

        {/* Interactive Schedule Section */}
        <section id="schedule-section" className="py-12 md:py-16 bg-background" tabIndex={-1}>
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl md:text-4xl font-heading font-bold">Interactive Schedule</h2>
                {isAdmin && (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin/schedule">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Schedule
                    </Link>
                  </Button>
                )}
              </div>
              {/* Unified Filter Toolbar */}
              <UnifiedScheduleToolbar
                activeCategory={activeTab as 'all' | 'event' | 'practice' | 'game'}
                onCategoryChange={(category) => setActiveTab(category)}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                selectedProgram={programFilter}
                onProgramChange={handleProgramChange}
                availablePrograms={programs || []}
                selectedDivision={divisionFilter}
                onDivisionChange={handleDivisionChange}
                availableDivisions={availableDivisions}
                selectedTeam={teamFilter}
                onTeamChange={setTeamFilter}
                availableTeams={availableTeams}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={handleClearAllFilters}
                activeFilterText={activeFilterText}
              />
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant={showPast ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPast(!showPast)}
                >
                  <History className="mr-2 h-4 w-4" />
                  {showPast ? "Showing All Events" : "Show Past Events"}
                </Button>
              </div>
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
                    {allEvents.filter(e => e.category === 'game').length}
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
                    {allEvents.filter(e => e.category === 'practice').length}
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
                    {allEvents.filter(e => e.category === 'event').length}
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
