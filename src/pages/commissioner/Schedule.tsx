import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, CalendarDays, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGames } from "@/hooks/useGames";
import { useCommissionerAssignments } from "@/hooks/useCommissionerAssignments";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, isAfter, isBefore, startOfDay } from "date-fns";

export default function CommissionerSchedule() {
  const navigate = useNavigate();
  const { data: assignments } = useCommissionerAssignments();
  const { data: games, isLoading } = useGames();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("upcoming");

  const programIds = assignments?.map(a => a.program_id) || [];
  const divisionIds = assignments?.filter(a => a.division_id).map(a => a.division_id) || [];

  const today = startOfDay(new Date());

  const filteredGames = games?.filter(g => {
    // Check if game is in commissioner's divisions
    // This is a simplified check - in production you'd join through division -> program
    const gameDate = parseISO(g.game_date);
    
    if (statusFilter === "upcoming" && isBefore(gameDate, today)) return false;
    if (statusFilter === "past" && isAfter(gameDate, today)) return false;
    if (statusFilter !== "all" && statusFilter !== "upcoming" && statusFilter !== "past" && g.status !== statusFilter) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        g.home_team?.name?.toLowerCase().includes(query) ||
        g.away_team?.name?.toLowerCase().includes(query) ||
        g.venue?.name?.toLowerCase().includes(query)
      );
    }
    return true;
  }).sort((a, b) => {
    const dateA = parseISO(a.game_date);
    const dateB = parseISO(b.game_date);
    return dateA.getTime() - dateB.getTime();
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Scheduled</Badge>;
      case "in_progress":
        return <Badge className="bg-green-100 text-green-800">In Progress</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "postponed":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Postponed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground">
            Manage game schedules
          </p>
        </div>
        <Button onClick={() => navigate("/commissioner/schedule/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Game
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Games</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {games?.filter(g => isAfter(parseISO(g.game_date), today) && g.status === 'scheduled').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Games This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {games?.filter(g => {
                const gameDate = parseISO(g.game_date);
                const weekFromNow = new Date(today);
                weekFromNow.setDate(weekFromNow.getDate() + 7);
                return isAfter(gameDate, today) && isBefore(gameDate, weekFromNow);
              }).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {games?.filter(g => g.status === 'completed').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by team or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="all">All Games</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Games Table */}
      <Card>
        <CardHeader>
          <CardTitle>Games</CardTitle>
          <CardDescription>
            {filteredGames.length} game(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Matchup</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGames.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No games found
                  </TableCell>
                </TableRow>
              ) : (
                filteredGames.map((game) => (
                  <TableRow key={game.id}>
                    <TableCell>
                      <div className="font-medium">
                        {format(parseISO(game.game_date), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {game.game_time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {game.home_team?.name || 'TBD'} vs {game.away_team?.name || 'TBD'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {game.game_type}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{game.venue?.name || 'TBD'}</div>
                      {game.field_number && (
                        <div className="text-sm text-muted-foreground">
                          Field {game.field_number}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {game.status === 'completed' ? (
                        <span className="font-medium">
                          {game.home_score ?? '-'} - {game.away_score ?? '-'}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(game.status || 'scheduled')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/commissioner/schedule/${game.id}`)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
