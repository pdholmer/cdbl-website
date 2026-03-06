import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useGames, type GameFilters } from "@/hooks/useGames";
import { useTeams } from "@/hooks/useTeams";
import { exportScheduleToCSV, exportForGameChangerSchedule } from "@/utils/scheduleExport";
import { Plus, Download, Calendar } from "lucide-react";
import { format } from "date-fns";

const getStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    scheduled: "default",
    in_progress: "secondary",
    completed: "outline",
    cancelled: "destructive",
    postponed: "secondary",
  };
  return <Badge variant={variants[status] || "default"}>{status}</Badge>;
};

export const GamesTab = () => {
  const currentDate = new Date().toISOString().split("T")[0];
  const [filters, setFilters] = useState<GameFilters>({ start_date: currentDate });
  const { data: games = [], isLoading } = useGames(filters);
  const { data: teams = [] } = useTeams();

  const stats = {
    total: games.length,
    upcoming: games.filter((g) => g.status === "scheduled" && new Date(g.game_date) >= new Date()).length,
    today: games.filter((g) => g.game_date === currentDate).length,
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => exportForGameChangerSchedule(games)}>
          <Download className="mr-2 h-4 w-4" />GameChanger CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => exportScheduleToCSV(games)}>
          <Download className="mr-2 h-4 w-4" />Export CSV
        </Button>
        <Link to="/admin/schedule/new">
          <Button size="sm"><Plus className="mr-2 h-4 w-4" />Schedule Game</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.upcoming}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Games</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.today}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter games by team, status, or date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filters.team_id || "all"} onValueChange={(v) => setFilters({ ...filters, team_id: v === "all" ? undefined : v })}>
              <SelectTrigger><SelectValue placeholder="All Teams" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.status || "all"} onValueChange={(v) => setFilters({ ...filters, status: v === "all" ? undefined : v })}>
              <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={filters.start_date || ""} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} />
            <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={filters.end_date || ""} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Home Team</TableHead>
              <TableHead>Away Team</TableHead>
              <TableHead>Facility</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
            ) : games.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center">No games found</TableCell></TableRow>
            ) : (
              games.map((game) => (
                <TableRow key={game.id}>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{format(new Date(game.game_date + "T00:00:00"), "MMM d, yyyy")}</div>
                      <div className="text-muted-foreground">{game.game_time}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{game.home_team?.name || "-"}</TableCell>
                  <TableCell className="font-medium">{game.away_team?.name || "-"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{game.venue?.name || "-"}</div>
                      {game.field_number && <div className="text-muted-foreground">Field {game.field_number}</div>}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{game.game_type.replace("_", " ")}</Badge></TableCell>
                  <TableCell>{getStatusBadge(game.status)}</TableCell>
                  <TableCell>{game.home_score !== null && game.away_score !== null ? `${game.home_score} - ${game.away_score}` : "-"}</TableCell>
                  <TableCell>
                    <Link to={`/admin/schedule/${game.id}`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
