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
import { ArrowLeft } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PlayerInsert = Database["public"]["Tables"]["players"]["Insert"];

const PlayerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: player, isLoading } = usePlayer(id);
  const { programs = [] } = usePrograms();
  const { createPlayer, updatePlayer } = usePlayerMutations();

  const { register, handleSubmit, reset, setValue, watch } = useForm<PlayerInsert>();

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

  const onSubmit = async (data: PlayerInsert) => {
    if (id) {
      await updatePlayer.mutateAsync({ id, updates: data });
    } else {
      await createPlayer.mutateAsync(data);
    }
    navigate("/admin/players");
  };

  const selectedProgramId = watch("program_id");
  const selectedProgram = programs.find((p) => p.id === selectedProgramId);

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
              <div className="grid grid-cols-2 gap-4">
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parent/Guardian Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parent_guardian_name">Parent/Guardian Name *</Label>
                <Input id="parent_guardian_name" {...register("parent_guardian_name", { required: true })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parent_email">Email *</Label>
                  <Input id="parent_email" type="email" {...register("parent_email", { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent_phone">Phone *</Label>
                  <Input id="parent_phone" {...register("parent_phone", { required: true })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_line1">Address Line 1</Label>
                <Input id="address_line1" {...register("address_line1")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input id="address_line2" {...register("address_line2")} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register("city")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" {...register("state")} defaultValue="OH" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip_code">Zip Code</Label>
                  <Input id="zip_code" {...register("zip_code")} />
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
