import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useTeam } from "@/hooks/useTeams";
import { useTeamMutations } from "@/hooks/useTeamMutations";
import { usePrograms } from "@/hooks/usePrograms";
import { usePlayers } from "@/hooks/usePlayers";
import { useCoaches } from "@/hooks/useCoaches";
import { useCoachMutations } from "@/hooks/useCoachMutations";
import { useRosterMutations } from "@/hooks/useRosterMutations";
import { ArrowLeft, UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TeamTasksCard } from "@/components/admin/TeamTasksCard";
import { TeamDatesCard } from "@/components/admin/TeamDatesCard";
import type { Database } from "@/integrations/supabase/types";

type TeamInsert = Database["public"]["Tables"]["teams"]["Insert"];

const TeamEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: team, isLoading } = useTeam(id);
  const { programs = [] } = usePrograms();
  const { data: availablePlayers = [] } = usePlayers({ status: "approved" });
  const { data: coaches = [] } = useCoaches({ status: "active" });
  const { createTeam, updateTeam } = useTeamMutations();
  const { assignCoachToTeam, removeCoachFromTeam } = useCoachMutations();
  const { addPlayerToTeam, removePlayerFromTeam } = useRosterMutations();

  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [selectedCoachId, setSelectedCoachId] = useState<string>("");
  const [coachRole, setCoachRole] = useState<string>("assistant_coach");

  const { register, handleSubmit, reset, setValue, watch } = useForm<TeamInsert>();

  useEffect(() => {
    if (team) {
      reset({
        ...team,
        season_year: team.season_year,
      });
    } else {
      reset({
        season_year: new Date().getFullYear(),
        max_roster_size: 12,
        status: "forming",
      });
    }
  }, [team, reset]);

  const onSubmit = async (data: TeamInsert) => {
    if (id) {
      await updateTeam.mutateAsync({ id, updates: data });
    } else {
      const result = await createTeam.mutateAsync(data);
      navigate(`/admin/teams/${result.id}`);
    }
  };

  const handleAddPlayer = async () => {
    if (!selectedPlayerId || !id) return;
    await addPlayerToTeam.mutateAsync({
      team_id: id,
      player_id: selectedPlayerId,
      season_year: team?.season_year || new Date().getFullYear(),
      status: "active",
    });
    setSelectedPlayerId("");
  };

  const handleRemovePlayer = async (rosterId: string, playerId: string) => {
    await removePlayerFromTeam.mutateAsync({ rosterId, playerId });
  };

  const handleAddCoach = async () => {
    if (!selectedCoachId || !id) return;
    await assignCoachToTeam.mutateAsync({
      team_id: id,
      coach_id: selectedCoachId,
      role: coachRole,
    });
    setSelectedCoachId("");
  };

  const handleRemoveCoach = async (assignmentId: string) => {
    await removeCoachFromTeam.mutateAsync(assignmentId);
  };

  const selectedProgramId = watch("program_id");
  const selectedProgram = programs.find((p) => p.id === selectedProgramId);
  const unassignedPlayers = availablePlayers.filter((p) => !p.team_id);

  if (isLoading && id) {
    return (
      <AdminLayout>
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/teams")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{id ? "Edit Team" : "Create New Team"}</h1>
            <p className="text-muted-foreground">
              {id ? "Update team information and manage roster" : "Set up a new team"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
              <CardDescription>Basic team details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name *</Label>
                  <Input id="name" {...register("name", { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nickname">Nickname</Label>
                  <Input id="nickname" {...register("nickname")} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="program_id">Program *</Label>
                  <Select
                    value={watch("program_id") || ""}
                    onValueChange={(value) => setValue("program_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="division_id">Division *</Label>
                  <Select
                    value={watch("division_id") || ""}
                    onValueChange={(value) => setValue("division_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProgram?.divisions?.map((division: any) => (
                        <SelectItem key={division.id} value={division.id}>
                          {division.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="season_year">Season Year *</Label>
                  <Input
                    id="season_year"
                    type="number"
                    {...register("season_year", { required: true, valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_roster_size">Max Roster Size</Label>
                  <Input
                    id="max_roster_size"
                    type="number"
                    {...register("max_roster_size", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color_primary">Primary Color</Label>
                  <Input id="color_primary" type="color" {...register("color_primary")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={watch("status") || "forming"}
                    onValueChange={(value) => setValue("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="forming">Forming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="disbanded">Disbanded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/admin/teams")}>
              Cancel
            </Button>
            <Button type="submit">{id ? "Update Team" : "Create Team"}</Button>
          </div>
        </form>

        {id && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Coaching Staff</CardTitle>
                <CardDescription>Manage coaches for this team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select value={selectedCoachId} onValueChange={setSelectedCoachId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select coach" />
                    </SelectTrigger>
                    <SelectContent>
                      {coaches.map((coach) => (
                        <SelectItem key={coach.id} value={coach.id}>
                          {coach.first_name} {coach.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={coachRole} onValueChange={setCoachRole}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="head_coach">Head Coach</SelectItem>
                      <SelectItem value="assistant_coach">Assistant Coach</SelectItem>
                      <SelectItem value="team_parent">Team Parent</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddCoach} disabled={!selectedCoachId}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team?.team_coaches?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No coaches assigned
                        </TableCell>
                      </TableRow>
                    ) : (
                      team?.team_coaches?.map((tc: any) => (
                        <TableRow key={tc.id}>
                          <TableCell>
                            {tc.coach.first_name} {tc.coach.last_name}
                          </TableCell>
                          <TableCell>
                            <Badge>{tc.role.replace("_", " ")}</Badge>
                          </TableCell>
                          <TableCell>{tc.coach.email}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCoach(tc.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Roster</CardTitle>
                <CardDescription>
                  Manage players ({team?.current_roster_count || 0} / {team?.max_roster_size || 12})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedPlayers.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.first_name} {player.last_name} - Age {player.age_at_registration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddPlayer} disabled={!selectedPlayerId}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Player
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Jersey #</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {team?.team_rosters?.filter((r: any) => r.status === "active").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No players on roster
                        </TableCell>
                      </TableRow>
                    ) : (
                      team?.team_rosters
                        ?.filter((r: any) => r.status === "active")
                        .map((roster: any) => (
                          <TableRow key={roster.id}>
                            <TableCell>
                              {roster.player.first_name} {roster.player.last_name}
                            </TableCell>
                            <TableCell>{roster.player.age_at_registration}</TableCell>
                            <TableCell>{roster.jersey_number || "-"}</TableCell>
                            <TableCell>{roster.position_primary || "-"}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemovePlayer(roster.id, roster.player.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Tasks & Milestones */}
            <TeamTasksCard teamId={id} />

            {/* Important Dates */}
            <TeamDatesCard teamId={id} />
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default TeamEdit;
