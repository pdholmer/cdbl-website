import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Users, Settings } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTeams } from "@/hooks/useTeams";
import { useTeamRosterCounts, formatRosterCount } from "@/hooks/useTeamRosterCounts";
import { useTeamMutations } from "@/hooks/useTeamMutations";
import { useCommissionerAssignments } from "@/hooks/useCommissionerAssignments";
import { usePrograms } from "@/hooks/usePrograms";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function CommissionerTeams() {
  const navigate = useNavigate();
  const { data: assignments } = useCommissionerAssignments();
  const { data: teams, isLoading } = useTeams();
  const { data: rosterCounts } = useTeamRosterCounts();
  const { programs } = usePrograms();
  const { createTeam } = useTeamMutations();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: "",
    division_id: "",
    program_id: "",
    season_year: new Date().getFullYear(),
  });

  const programIds = assignments?.map(a => a.program_id) || [];
  const assignedPrograms = programs?.filter(p => programIds.includes(p.id)) || [];

  const filteredTeams = teams?.filter(t => {
    if (!programIds.includes(t.program_id)) return false;
    if (statusFilter && statusFilter !== "all" && t.status !== statusFilter) return false;
    if (searchQuery) {
      return t.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "forming":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Forming</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name || !newTeam.division_id || !newTeam.program_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createTeam.mutateAsync({
        name: newTeam.name,
        division_id: newTeam.division_id,
        program_id: newTeam.program_id,
        season_year: newTeam.season_year,
        status: 'forming',
      });
      setShowCreateDialog(false);
      setNewTeam({
        name: "",
        division_id: "",
        program_id: "",
        season_year: new Date().getFullYear(),
      });
      toast.success("Team created successfully");
    } catch (error) {
      toast.error("Failed to create team");
    }
  };

  // Get divisions for selected program
  const selectedProgram = assignedPrograms.find(p => p.id === newTeam.program_id);
  const availableDivisions = selectedProgram?.divisions || [];

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
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">
            Manage teams in your league
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="forming">Forming</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teams Table */}
      <Card>
        <CardHeader>
          <CardTitle>League Teams</CardTitle>
          <CardDescription>
            {filteredTeams.length} team(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Roster</TableHead>
                <TableHead>Head Coach</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No teams found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {team.color_primary && (
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: team.color_primary }}
                          />
                        )}
                        <div>
                          <div className="font-medium">{team.name}</div>
                          {team.nickname && (
                            <div className="text-sm text-muted-foreground">{team.nickname}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{team.division?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {formatRosterCount(rosterCounts?.get(team.id))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {team.team_coaches?.find((tc: any) => tc.role === 'head_coach')?.coach
                        ? `${team.team_coaches.find((tc: any) => tc.role === 'head_coach').coach.first_name} ${team.team_coaches.find((tc: any) => tc.role === 'head_coach').coach.last_name}`
                        : 'Unassigned'}
                    </TableCell>
                    <TableCell>{getStatusBadge(team.status || 'forming')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/commissioner/teams/${team.id}`)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Team Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Add a new team to your league
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="e.g., Blue Jays"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="program">Program</Label>
              <Select 
                value={newTeam.program_id} 
                onValueChange={(value) => setNewTeam({ ...newTeam, program_id: value, division_id: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {assignedPrograms.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="division">Division</Label>
              <Select 
                value={newTeam.division_id} 
                onValueChange={(value) => setNewTeam({ ...newTeam, division_id: value })}
                disabled={!newTeam.program_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  {availableDivisions.map((division: any) => (
                    <SelectItem key={division.id} value={division.id}>
                      {division.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="season">Season Year</Label>
              <Input
                id="season"
                type="number"
                value={newTeam.season_year}
                onChange={(e) => setNewTeam({ ...newTeam, season_year: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeam} disabled={createTeam.isPending}>
              Create Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
