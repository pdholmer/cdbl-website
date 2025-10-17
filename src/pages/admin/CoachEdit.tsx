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
import { useCoach } from "@/hooks/useCoaches";
import { useCoachMutations } from "@/hooks/useCoachMutations";
import { ArrowLeft } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type CoachInsert = Database["public"]["Tables"]["coaches"]["Insert"];

const CoachEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: coach, isLoading } = useCoach(id);
  const { createCoach, updateCoach } = useCoachMutations();

  const { register, handleSubmit, reset, setValue, watch } = useForm<CoachInsert>();

  useEffect(() => {
    if (coach) {
      reset(coach);
    }
  }, [coach, reset]);

  const onSubmit = async (data: CoachInsert) => {
    if (id) {
      await updateCoach.mutateAsync({ id, updates: data });
    } else {
      await createCoach.mutateAsync(data);
    }
    navigate("/admin/coaches");
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/coaches")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{id ? "Edit Coach" : "Add New Coach"}</h1>
            <p className="text-muted-foreground">
              {id ? "Update coach information" : "Register a new coach"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Coach Information</CardTitle>
              <CardDescription>Basic contact details</CardDescription>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...register("email", { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" {...register("phone", { required: true })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Background Check</CardTitle>
              <CardDescription>Track background check status and dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="background_check_status">Status</Label>
                <Select
                  value={watch("background_check_status") || ""}
                  onValueChange={(value) => setValue("background_check_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="background_check_date">Check Date</Label>
                  <Input id="background_check_date" type="date" {...register("background_check_date")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="background_check_expiry">Expiry Date</Label>
                  <Input
                    id="background_check_expiry"
                    type="date"
                    {...register("background_check_expiry")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Coaching Experience</CardTitle>
              <CardDescription>Experience and certifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coaching_experience">Experience</Label>
                <Textarea
                  id="coaching_experience"
                  placeholder="Describe coaching experience..."
                  {...register("coaching_experience")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch("status") || "active"}
                  onValueChange={(value) => setValue("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_notes">Admin Notes</Label>
                <Textarea id="admin_notes" {...register("admin_notes")} />
              </div>
            </CardContent>
          </Card>

          {id && coach?.team_coaches && coach.team_coaches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Team Assignments</CardTitle>
                <CardDescription>Current team coaching assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {coach.team_coaches.map((tc: any) => (
                    <div key={tc.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{tc.team.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {tc.role.replace("_", " ")} - {tc.team.division.name} ({tc.team.season_year})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/admin/coaches")}>
              Cancel
            </Button>
            <Button type="submit">{id ? "Update Coach" : "Create Coach"}</Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default CoachEdit;
