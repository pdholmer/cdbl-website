import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlayer } from "@/hooks/usePlayers";
import { usePlayerMutations } from "@/hooks/usePlayerMutations";
import { usePrograms } from "@/hooks/usePrograms";
import { GuardianDialog } from "@/components/GuardianDialog";
import { useGuardianMutations } from "@/hooks/useGuardianMutations";
import { ArrowLeft } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PlayerInsert = Database["public"]["Tables"]["players"]["Insert"];

interface ExtendedPlayerForm extends PlayerInsert {
  parent2_first_name?: string;
  parent2_last_name?: string;
  parent2_email?: string;
  parent2_phone?: string;
  parent2_relationship?: string;
}

const PlayerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: player, isLoading } = usePlayer(id);
  const { programs = [] } = usePrograms();
  const { createPlayer, updatePlayer } = usePlayerMutations();
  const { createGuardian } = useGuardianMutations();

  const { register, handleSubmit, reset, setValue, watch } = useForm<ExtendedPlayerForm>();

  useEffect(() => {
    if (player) {
      reset(player);
    }
  }, [player, reset]);

  // Auto-calculate age from date of birth
  const dateOfBirth = watch("date_of_birth");
  useEffect(() => {
    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      // Adjust age if birthday hasn't occurred yet this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      setValue("age_at_registration", age);
    }
  }, [dateOfBirth, setValue]);

  const selectedProgramId = watch("program_id");
  const selectedDivisionId = watch("division_id");
  const selectedProgram = programs?.find((p) => p.id === selectedProgramId);
  
  // Clear division when program changes
  useEffect(() => {
    if (selectedProgramId && selectedDivisionId) {
      // Check if the current division belongs to the selected program
      const divisionBelongsToProgram = selectedProgram?.divisions?.some(
        (d: any) => d.id === selectedDivisionId
      );
      
      if (!divisionBelongsToProgram) {
        setValue("division_id", "");
      }
    }
  }, [selectedProgramId, selectedProgram, selectedDivisionId, setValue]);

  const onSubmit = async (data: ExtendedPlayerForm) => {
    const {
      parent2_first_name,
      parent2_last_name,
      parent2_email,
      parent2_phone,
      parent2_relationship,
      ...playerData
    } = data;

    const submissionData = {
      ...playerData,
      parent_guardian_name: `${data.parent_first_name || ''} ${data.parent_last_name || ''}`.trim(),
    };

    try {
      if (id) {
        await updatePlayer.mutateAsync({ id, updates: submissionData });
        
        if (parent2_first_name && parent2_last_name && parent2_email && parent2_phone) {
          await createGuardian.mutateAsync({
            player_id: id,
            first_name: parent2_first_name,
            last_name: parent2_last_name,
            email: parent2_email,
            phone: parent2_phone,
            relationship: parent2_relationship || 'guardian',
            is_primary: false,
          });
        }
      } else {
        const newPlayer = await createPlayer.mutateAsync(submissionData);
        
        if (newPlayer && parent2_first_name && parent2_last_name && parent2_email && parent2_phone) {
          await createGuardian.mutateAsync({
            player_id: newPlayer.id,
            first_name: parent2_first_name,
            last_name: parent2_last_name,
            email: parent2_email,
            phone: parent2_phone,
            relationship: parent2_relationship || 'guardian',
            is_primary: false,
          });
        }
      }
      navigate("/admin/players");
    } catch (error) {
      console.error("Error saving player:", error);
    }
  };

  if (isLoading) {
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/players")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{id ? "Edit Player" : "Add New Player"}</h1>
            <p className="text-muted-foreground">
              {id ? "Update player information" : "Register a new player"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Player Information</CardTitle>
              <CardDescription>Basic player details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input id="first_name" {...register("first_name", { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input id="last_name" {...register("last_name", { required: true })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <Input id="date_of_birth" type="date" {...register("date_of_birth", { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age_at_registration">Age</Label>
                  <Input 
                    id="age_at_registration" 
                    type="number" 
                    {...register("age_at_registration")} 
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={watch("gender") || ""}
                    onValueChange={(value) => setValue("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="program_id">Program</Label>
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
                  <Label htmlFor="division_id">Division</Label>
                  <Select
                    value={watch("division_id") || ""}
                    onValueChange={(value) => setValue("division_id", value)}
                    disabled={!selectedProgramId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedProgramId ? "Select division" : "Select a program first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProgram?.divisions?.map((division: any) => (
                        <SelectItem key={division.id} value={division.id}>
                          {division.name} (Ages {division.age_range})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team_name">Team</Label>
                  <Select
                    value={watch("team_name") || ""}
                    onValueChange={(value) => setValue("team_name", value)}
                    disabled={!selectedProgramId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedProgramId ? "Select team" : "Select a program first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                    {selectedProgram?.type === 'in_house' ? (
                      <>
                        <SelectItem value="Orioles">Orioles</SelectItem>
                        <SelectItem value="Red Sox">Red Sox</SelectItem>
                        <SelectItem value="Yankees">Yankees</SelectItem>
                        <SelectItem value="Rays">Rays</SelectItem>
                        <SelectItem value="Blue Jays">Blue Jays</SelectItem>
                        <SelectItem value="White Sox">White Sox</SelectItem>
                        <SelectItem value="Guardians">Guardians</SelectItem>
                        <SelectItem value="Tigers">Tigers</SelectItem>
                        <SelectItem value="Royals">Royals</SelectItem>
                        <SelectItem value="Twins">Twins</SelectItem>
                        <SelectItem value="Astros">Astros</SelectItem>
                        <SelectItem value="Angels">Angels</SelectItem>
                        <SelectItem value="Athletics">Athletics</SelectItem>
                        <SelectItem value="Mariners">Mariners</SelectItem>
                        <SelectItem value="Rangers">Rangers</SelectItem>
                        <SelectItem value="Braves">Braves</SelectItem>
                        <SelectItem value="Marlins">Marlins</SelectItem>
                        <SelectItem value="Mets">Mets</SelectItem>
                        <SelectItem value="Phillies">Phillies</SelectItem>
                        <SelectItem value="Nationals">Nationals</SelectItem>
                        <SelectItem value="Cubs">Cubs</SelectItem>
                        <SelectItem value="Reds">Reds</SelectItem>
                        <SelectItem value="Brewers">Brewers</SelectItem>
                        <SelectItem value="Pirates">Pirates</SelectItem>
                        <SelectItem value="Cardinals">Cardinals</SelectItem>
                        <SelectItem value="Diamondbacks">Diamondbacks</SelectItem>
                        <SelectItem value="Rockies">Rockies</SelectItem>
                        <SelectItem value="Dodgers">Dodgers</SelectItem>
                        <SelectItem value="Padres">Padres</SelectItem>
                        <SelectItem value="Giants">Giants</SelectItem>
                      </>
                    ) : selectedProgram?.type === 'travel' ? (
                      <>
                        <SelectItem value="Blue">Blue</SelectItem>
                        <SelectItem value="White">White</SelectItem>
                        <SelectItem value="Gray">Gray</SelectItem>
                        <SelectItem value="IHTT">IHTT</SelectItem>
                      </>
                    ) : null}
                  </SelectContent>
                </Select>
              </div>
            </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Parent/Guardian Contact</CardTitle>
              {id && <GuardianDialog playerId={id} />}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Primary Parent/Guardian</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="parent_first_name">First Name *</Label>
                    <Input
                      id="parent_first_name"
                      {...register("parent_first_name", { required: true })}
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent_last_name">Last Name *</Label>
                    <Input
                      id="parent_last_name"
                      {...register("parent_last_name", { required: true })}
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="parent_email">Email *</Label>
                    <Input
                      id="parent_email"
                      type="email"
                      {...register("parent_email", { required: true })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent_phone">Phone *</Label>
                    <Input
                      id="parent_phone"
                      {...register("parent_phone", { required: true })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <h3 className="text-sm font-semibold text-muted-foreground">Second Parent/Guardian (Optional)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="parent2_first_name">First Name</Label>
                    <Input
                      id="parent2_first_name"
                      {...register("parent2_first_name")}
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent2_last_name">Last Name</Label>
                    <Input
                      id="parent2_last_name"
                      {...register("parent2_last_name")}
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="parent2_email">Email</Label>
                    <Input
                      id="parent2_email"
                      type="email"
                      {...register("parent2_email")}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent2_phone">Phone</Label>
                    <Input
                      id="parent2_phone"
                      {...register("parent2_phone")}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent2_relationship">Relationship</Label>
                  <Select
                    value={watch("parent2_relationship") || ""}
                    onValueChange={(value) => setValue("parent2_relationship", value)}
                  >
                    <SelectTrigger id="parent2_relationship">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mother">Mother</SelectItem>
                      <SelectItem value="father">Father</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="stepparent">Step-parent</SelectItem>
                      <SelectItem value="grandparent">Grandparent</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t">
                <h3 className="text-sm font-semibold text-muted-foreground">Address</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="address_line1">Address Line 1</Label>
                    <Input
                      id="address_line1"
                      {...register("address_line1")}
                      placeholder="Street address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_line2">Address Line 2</Label>
                    <Input
                      id="address_line2"
                      {...register("address_line2")}
                      placeholder="Apt, suite, etc."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...register("city")}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      {...register("state")}
                      defaultValue="OH"
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">Zip Code</Label>
                    <Input
                      id="zip_code"
                      {...register("zip_code")}
                      placeholder="12345"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registration Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={watch("status") || "pending"}
                    onValueChange={(value) => setValue("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="waitlist">Waitlist</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_status">Payment Status</Label>
                  <Select
                    value={watch("payment_status") || "unpaid"}
                    onValueChange={(value) => setValue("payment_status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="scholarship">Scholarship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount_due">Amount Due</Label>
                  <Input id="amount_due" type="number" step="0.01" {...register("amount_due")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount_paid">Amount Paid</Label>
                  <Input id="amount_paid" type="number" step="0.01" {...register("amount_paid")} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jersey_size">Jersey Size</Label>
                  <Select
                    value={watch("jersey_size") || ""}
                    onValueChange={(value) => setValue("jersey_size", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YXS">Youth XS</SelectItem>
                      <SelectItem value="YS">Youth S</SelectItem>
                      <SelectItem value="YM">Youth M</SelectItem>
                      <SelectItem value="YL">Youth L</SelectItem>
                      <SelectItem value="AS">Adult S</SelectItem>
                      <SelectItem value="AM">Adult M</SelectItem>
                      <SelectItem value="AL">Adult L</SelectItem>
                      <SelectItem value="AXL">Adult XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skill_level">Skill Level</Label>
                  <Select
                    value={watch("skill_level") || ""}
                    onValueChange={(value) => setValue("skill_level", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="not_sure">Not Sure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="medical_notes">Medical Notes</Label>
                <Textarea id="medical_notes" {...register("medical_notes")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="special_requests">Special Requests</Label>
                <Textarea id="special_requests" {...register("special_requests")} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/admin/players")}>
              Cancel
            </Button>
            <Button type="submit">{id ? "Update Player" : "Create Player"}</Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default PlayerEdit;
