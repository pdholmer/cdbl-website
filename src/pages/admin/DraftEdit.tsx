import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Shuffle, Trash2, Users, Play, Star } from "lucide-react";
import { useDraft } from "@/hooks/useDrafts";
import { useDraftMutations } from "@/hooks/useDraftMutations";
import { useDraftTeams, useDraftTeamMutations } from "@/hooks/useDraftTeams";
import { useDraftPlayerPool, useDraftPlayerPoolMutations } from "@/hooks/useDraftPlayerPool";
import { usePrograms } from "@/hooks/usePrograms";
import { useTeamHierarchy } from "@/hooks/useTeamHierarchy";
import { usePlayers } from "@/hooks/usePlayers";
import { toast } from "sonner";

interface DraftFormData {
  name: string;
  program_id: string;
  division_id: string;
  season_year: number;
  draft_type: string;
  scheduled_start: string;
  pick_time_limit: number;
  auto_pick_enabled: boolean;
  total_rounds: number;
}

export default function DraftEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const { data: draft, isLoading: draftLoading } = useDraft(isNew ? undefined : id);
  const { programs } = usePrograms();
  const hierarchy = useTeamHierarchy();
  const { createDraft, updateDraft } = useDraftMutations();
  const { data: draftTeams } = useDraftTeams(isNew ? undefined : id);
  const { addTeam, removeTeam, randomizeOrder } = useDraftTeamMutations();
  const { data: playerPool } = useDraftPlayerPool(isNew ? undefined : id);
  const { addMultiplePlayers, updatePlayer, removePlayer } = useDraftPlayerPoolMutations();

  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  // Get players for selected division
  const { data: divisionPlayers } = usePlayers({
    division_id: selectedDivisionId || draft?.division_id || undefined,
  });

  const form = useForm<DraftFormData>({
    defaultValues: {
      name: "",
      program_id: "",
      division_id: "",
      season_year: new Date().getFullYear(),
      draft_type: "snake",
      scheduled_start: "",
      pick_time_limit: 60,
      auto_pick_enabled: true,
      total_rounds: 12,
    },
  });

  // Update form when draft data loads
  useEffect(() => {
    if (draft) {
      form.reset({
        name: draft.name,
        program_id: draft.program_id || "",
        division_id: draft.division_id || "",
        season_year: draft.season_year,
        draft_type: draft.draft_type,
        scheduled_start: draft.scheduled_start?.slice(0, 16) || "",
        pick_time_limit: draft.pick_time_limit,
        auto_pick_enabled: draft.auto_pick_enabled,
        total_rounds: draft.total_rounds,
      });
      setSelectedProgramId(draft.program_id || "");
      setSelectedDivisionId(draft.division_id || "");
    }
  }, [draft, form]);

  const divisions = hierarchy
    ?.find((p) => p.id === selectedProgramId)
    ?.divisions || [];

  const availableTeams = hierarchy
    ?.find((p) => p.id === selectedProgramId)
    ?.divisions?.find((d) => d.id === selectedDivisionId)
    ?.teams?.filter((t) => !draftTeams?.some((dt) => dt.team_id === t.id)) || [];

  const playersNotInPool = divisionPlayers?.filter(
    (p) => !playerPool?.some((pp) => pp.player_id === p.id)
  ) || [];

  const onSubmit = async (data: DraftFormData) => {
    try {
      if (isNew) {
        const result = await createDraft.mutateAsync({
          ...data,
          scheduled_start: data.scheduled_start || undefined,
        });
        navigate(`/admin/drafts/${result.id}`);
      } else if (id) {
        await updateDraft.mutateAsync({ id, ...data });
        toast.success("Draft updated");
      }
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  };

  const handleAddTeams = async () => {
    if (!id || selectedTeamIds.length === 0) return;

    const currentOrder = draftTeams?.length || 0;
    for (let i = 0; i < selectedTeamIds.length; i++) {
      await addTeam.mutateAsync({
        draft_id: id,
        team_id: selectedTeamIds[i],
        draft_order: currentOrder + i + 1,
      });
    }
    setSelectedTeamIds([]);
  };

  const handleAddPlayers = async () => {
    if (!id || selectedPlayerIds.length === 0) return;

    const playersToAdd = selectedPlayerIds.map((playerId) => ({
      draft_id: id,
      player_id: playerId,
    }));

    await addMultiplePlayers.mutateAsync(playersToAdd);
    setSelectedPlayerIds([]);
  };

  const handleAddAllPlayers = async () => {
    if (!id || playersNotInPool.length === 0) return;

    const playersToAdd = playersNotInPool.map((player) => ({
      draft_id: id,
      player_id: player.id,
    }));

    await addMultiplePlayers.mutateAsync(playersToAdd);
  };

  const handleStartDraft = async () => {
    if (!id) return;

    if (!draftTeams || draftTeams.length < 2) {
      toast.error("Need at least 2 teams to start a draft");
      return;
    }

    if (!playerPool || playerPool.length === 0) {
      toast.error("No players in the draft pool");
      return;
    }

    await updateDraft.mutateAsync({
      id,
      status: "in_progress",
      actual_start: new Date().toISOString(),
    });

    navigate(`/admin/drafts/${id}/live`);
  };

  if (!isNew && draftLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading draft...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/drafts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">
              {isNew ? "Create New Draft" : draft?.name || "Edit Draft"}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? "Set up a new player draft" : "Configure draft settings and participants"}
            </p>
          </div>
          {!isNew && draft?.status === "setup" && (
            <Button onClick={handleStartDraft} disabled={!draftTeams?.length || !playerPool?.length}>
              <Play className="h-4 w-4 mr-2" />
              Start Draft
            </Button>
          )}
        </div>

        <Tabs defaultValue="settings">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            {!isNew && <TabsTrigger value="teams">Teams ({draftTeams?.length || 0})</TabsTrigger>}
            {!isNew && <TabsTrigger value="players">Player Pool ({playerPool?.length || 0})</TabsTrigger>}
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Configure the draft name and scheduling</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      rules={{ required: "Name is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Draft Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Spring 2025 Majors Draft" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="program_id"
                        rules={{ required: "Program is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Program</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedProgramId(value);
                                form.setValue("division_id", "");
                                setSelectedDivisionId("");
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select program" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {programs?.map((program) => (
                                  <SelectItem key={program.id} value={program.id}>
                                    {program.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="division_id"
                        rules={{ required: "Division is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Division</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedDivisionId(value);
                              }}
                              disabled={!selectedProgramId}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select division" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {divisions?.map((division) => (
                                  <SelectItem key={division.id} value={division.id}>
                                    {division.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="season_year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Season Year</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="scheduled_start"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scheduled Start</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormDescription>When the draft is scheduled to begin</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Draft Settings</CardTitle>
                    <CardDescription>Configure how the draft will run</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="draft_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Draft Type</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="snake">Snake Draft</SelectItem>
                                <SelectItem value="linear">Linear Draft</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Snake reverses order each round
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="total_rounds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Rounds</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={30}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pick_time_limit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pick Time Limit (seconds)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={15}
                                max={300}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="auto_pick_enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Auto-Pick Enabled</FormLabel>
                            <FormDescription>
                              Automatically pick from queue when timer expires
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => navigate("/admin/drafts")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createDraft.isPending || updateDraft.isPending}>
                    {isNew ? "Create Draft" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {!isNew && (
            <TabsContent value="teams" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Teams</CardTitle>
                  <CardDescription>Select teams to participate in this draft</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (!selectedTeamIds.includes(value)) {
                          setSelectedTeamIds([...selectedTeamIds, value]);
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a team to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTeams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAddTeams} disabled={selectedTeamIds.length === 0}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Selected
                    </Button>
                  </div>

                  {selectedTeamIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTeamIds.map((teamId) => {
                        const team = availableTeams.find((t) => t.id === teamId);
                        return (
                          <Badge
                            key={teamId}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() =>
                              setSelectedTeamIds(selectedTeamIds.filter((id) => id !== teamId))
                            }
                          >
                            {team?.name} ×
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Draft Order</CardTitle>
                    <CardDescription>Teams will pick in this order</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => id && randomizeOrder.mutateAsync(id)}
                    disabled={!draftTeams?.length}
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Randomize Order
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Order</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>Coach</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {draftTeams?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Users className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">No teams added yet</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        draftTeams?.map((dt) => (
                          <TableRow key={dt.id}>
                            <TableCell>
                              <Badge variant="outline">{dt.draft_order}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{dt.team?.name}</TableCell>
                            <TableCell>
                              {dt.coach
                                ? `${dt.coach.first_name} ${dt.coach.last_name}`
                                : "Unassigned"}
                            </TableCell>
                            <TableCell>
                              {dt.is_ready ? (
                                <Badge className="bg-green-500">Ready</Badge>
                              ) : (
                                <Badge variant="secondary">Not Ready</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeTeam.mutateAsync({ id: dt.id, draftId: id! })
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {!isNew && (
            <TabsContent value="players" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Add Players to Pool</CardTitle>
                    <CardDescription>
                      {playersNotInPool.length} players from this division not yet in pool
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddAllPlayers} disabled={playersNotInPool.length === 0}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add All ({playersNotInPool.length})
                  </Button>
                </CardHeader>
                <CardContent>
                  {playersNotInPool.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                        {playersNotInPool.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center space-x-2 p-2 border rounded"
                          >
                            <Checkbox
                              checked={selectedPlayerIds.includes(player.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedPlayerIds([...selectedPlayerIds, player.id]);
                                } else {
                                  setSelectedPlayerIds(
                                    selectedPlayerIds.filter((id) => id !== player.id)
                                  );
                                }
                              }}
                            />
                            <Label className="text-sm">
                              {player.first_name} {player.last_name}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={handleAddPlayers}
                        disabled={selectedPlayerIds.length === 0}
                        variant="outline"
                      >
                        Add Selected ({selectedPlayerIds.length})
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Player Pool ({playerPool?.length || 0})</CardTitle>
                  <CardDescription>Players available for drafting</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Player</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Skill Level</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {playerPool?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <Users className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">No players in pool</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        playerPool?.map((pp) => (
                          <TableRow key={pp.id}>
                            <TableCell className="font-medium">
                              {pp.player.first_name} {pp.player.last_name}
                            </TableCell>
                            <TableCell>{pp.player.age_at_registration || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{pp.player.skill_level || "Unknown"}</Badge>
                            </TableCell>
                            <TableCell>
                              {pp.player.previous_experience ? "Yes" : "No"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 cursor-pointer ${
                                      star <= (pp.skill_rating || 0)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    }`}
                                    onClick={() =>
                                      updatePlayer.mutateAsync({
                                        id: pp.id,
                                        skill_rating: star,
                                      })
                                    }
                                  />
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {pp.is_available ? (
                                <Badge className="bg-green-500">Available</Badge>
                              ) : (
                                <Badge variant="secondary">Drafted</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removePlayer.mutateAsync({ id: pp.id, draftId: id! })
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AdminLayout>
  );
}
