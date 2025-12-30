import { Link } from "react-router-dom";
import { 
  Users, 
  ClipboardList, 
  UsersRound, 
  CalendarDays, 
  UserPlus,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCommissionerAssignments } from "@/hooks/useCommissionerAssignments";
import { usePlayers } from "@/hooks/usePlayers";
import { useTeams } from "@/hooks/useTeams";
import { useGames } from "@/hooks/useGames";
import { useDrafts } from "@/hooks/useDrafts";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function CommissionerDashboard() {
  const { data: assignments, isLoading: assignmentsLoading } = useCommissionerAssignments();
  const { data: players } = usePlayers();
  const { data: teams } = useTeams();
  const { data: games } = useGames();
  const { data: drafts } = useDrafts();

  // Filter data based on commissioner's assigned programs
  const programIds = assignments?.map(a => a.program_id) || [];
  const divisionIds = assignments?.filter(a => a.division_id).map(a => a.division_id) || [];

  const filteredPlayers = players?.filter(p => 
    programIds.includes(p.program_id || '')
  ) || [];

  const filteredTeams = teams?.filter(t => 
    programIds.includes(t.program_id)
  ) || [];

  const pendingRegistrations = filteredPlayers.filter(p => p.status === 'pending').length;
  const activeTeams = filteredTeams.filter(t => t.status === 'active').length;

  const upcomingGames = games?.filter(g => {
    const gameDate = new Date(g.game_date);
    const today = new Date();
    return gameDate >= today && g.status === 'scheduled';
  }).slice(0, 5) || [];

  const activeDrafts = drafts?.filter(d => 
    programIds.includes(d.program_id || '') && 
    (d.status === 'setup' || d.status === 'in_progress')
  ) || [];

  if (assignmentsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold mb-4">No Assignments</h1>
        <p className="text-muted-foreground mb-6">
          You haven't been assigned to any programs yet. Please contact an administrator.
        </p>
        <Button asChild>
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Commissioner Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your league: {assignments.map(a => a.program?.name).join(", ")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPlayers.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingRegistrations} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <UsersRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTeams}</div>
            <p className="text-xs text-muted-foreground">
              {filteredTeams.length} total teams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Games</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingGames.length}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Drafts</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDrafts.length}</div>
            <p className="text-xs text-muted-foreground">
              Setup or in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Pending Registrations
            </CardTitle>
            <CardDescription>
              Review and approve player registrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{pendingRegistrations}</div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/commissioner/registrations">
                Review Registrations
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Invite Coaches
            </CardTitle>
            <CardDescription>
              Send invitations to new coaches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Invite coaches to join your league and manage their teams.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/commissioner/coaches">
                Manage Coaches
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Run a Draft
            </CardTitle>
            <CardDescription>
              Create and manage player drafts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Set up a new draft or manage existing ones.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/commissioner/drafts">
                Manage Drafts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Games */}
      {upcomingGames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Games</CardTitle>
            <CardDescription>Next scheduled games</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingGames.map((game) => (
                <div key={game.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {game.home_team?.name || 'TBD'} vs {game.away_team?.name || 'TBD'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {game.venue?.name || 'TBD'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {format(new Date(game.game_date), 'MMM d')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {game.game_time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild variant="link" className="mt-4 p-0">
              <Link to="/commissioner/schedule">
                View Full Schedule
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
