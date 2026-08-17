import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTeams, type TeamFilters } from "@/hooks/useTeams";
import { useTeamRosterCounts, formatRosterCount } from "@/hooks/useTeamRosterCounts";
import { usePrograms } from "@/hooks/usePrograms";
import { Users, Plus, Search, Shield } from "lucide-react";

const Teams = () => {
  const currentYear = new Date().getFullYear();
  const [filters, setFilters] = useState<TeamFilters>({ season_year: currentYear });
  const { data: teams = [], isLoading } = useTeams(filters);
  const { programs = [] } = usePrograms();
  const { data: rosterCounts } = useTeamRosterCounts();

  const stats = {
    total: teams.length,
    active: teams.filter((t) => t.status === "active").length,
    forming: teams.filter((t) => t.status === "forming").length,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      forming: "secondary",
      completed: "outline",
      disbanded: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-muted-foreground">Manage teams and rosters</p>
          </div>
          <Link to="/admin/teams/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forming</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.forming}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  className="pl-8"
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <Select
                value={filters.program_id || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, program_id: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="forming">Forming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.season_year?.toString() || currentYear.toString()}
                onValueChange={(value) =>
                  setFilters({ ...filters, season_year: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year} Season
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Name</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Roster</TableHead>
                <TableHead>Head Coach</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No teams found
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team) => {
                  const headCoach = team.team_coaches?.find((tc: any) => tc.role === "head_coach");
                  return (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">
                        {team.name}
                        {team.nickname && (
                          <span className="text-muted-foreground ml-2">({team.nickname})</span>
                        )}
                      </TableCell>
                      <TableCell>{team.division?.name || "-"}</TableCell>
                      <TableCell>{team.program?.name || "-"}</TableCell>
                      <TableCell>
                        {formatRosterCount(rosterCounts?.get(team.id))}
                      </TableCell>
                      <TableCell>
                        {headCoach ? (
                          <div className="text-sm">
                            {headCoach.coach.first_name} {headCoach.coach.last_name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No coach assigned</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(team.status)}</TableCell>
                      <TableCell>
                        <Link to={`/admin/teams/${team.id}`}>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Teams;
