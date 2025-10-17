import { useState } from "react";
import { useForm } from "react-hook-form";
import { UserPlus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGuardians } from "@/hooks/useGuardians";
import { useGuardianMutations } from "@/hooks/useGuardianMutations";
import { Card, CardContent } from "@/components/ui/card";

interface GuardianDialogProps {
  playerId: string;
}

interface GuardianFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  relationship: string;
}

export const GuardianDialog = ({ playerId }: GuardianDialogProps) => {
  const [open, setOpen] = useState(false);
  const { data: guardians = [], isLoading } = useGuardians(playerId);
  const { createGuardian, deleteGuardian } = useGuardianMutations();
  const { register, handleSubmit, reset, setValue, watch } = useForm<GuardianFormData>();

  const onSubmit = (data: GuardianFormData) => {
    createGuardian.mutate(
      {
        player_id: playerId,
        ...data,
      },
      {
        onSuccess: () => {
          reset();
        },
      }
    );
  };

  const handleDelete = (guardianId: string) => {
    if (confirm("Are you sure you want to remove this guardian?")) {
      deleteGuardian.mutate({ id: guardianId, player_id: playerId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Parent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Additional Parents/Guardians</DialogTitle>
        </DialogHeader>

        {/* Existing Guardians */}
        {guardians.length > 0 && (
          <div className="space-y-3 mb-6">
            <h3 className="text-sm font-semibold">Additional Guardians</h3>
            {guardians.map((guardian) => (
              <Card key={guardian.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {guardian.first_name} {guardian.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{guardian.email}</p>
                      <p className="text-sm text-muted-foreground">{guardian.phone}</p>
                      {guardian.relationship && (
                        <p className="text-sm text-muted-foreground capitalize">
                          {guardian.relationship}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(guardian.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add New Guardian Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h3 className="text-sm font-semibold">Add New Guardian</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input {...register("first_name")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input {...register("last_name")} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input type="email" {...register("email")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input {...register("phone")} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Select
              value={watch("relationship") || ""}
              onValueChange={(value) => setValue("relationship", value)}
            >
              <SelectTrigger>
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

          <Button type="submit" className="w-full">
            Add Guardian
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
