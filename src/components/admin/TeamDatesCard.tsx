import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTeamImportantDates, useTeamDateMutations } from "@/hooks/useTeamTasks";
import { Plus, Calendar, X } from "lucide-react";
import { format } from "date-fns";

interface TeamDatesCardProps {
  teamId: string;
}

const dateTypeLabels: Record<string, string> = {
  practice_start: "Practice Start",
  season_start: "Season Start",
  season_end: "Season End",
  tournament: "Tournament",
  tryout: "Tryout",
  other: "Other",
};

const dateTypeColors: Record<string, string> = {
  practice_start: "bg-green-100 text-green-700",
  season_start: "bg-blue-100 text-blue-700",
  season_end: "bg-purple-100 text-purple-700",
  tournament: "bg-orange-100 text-orange-700",
  tryout: "bg-cyan-100 text-cyan-700",
  other: "bg-slate-100 text-slate-700",
};

export function TeamDatesCard({ teamId }: TeamDatesCardProps) {
  const { data: dates = [], isLoading } = useTeamImportantDates(teamId);
  const { createDate, deleteDate } = useTeamDateMutations();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date_value: "",
    date_type: "other" as "practice_start" | "season_start" | "season_end" | "tournament" | "tryout" | "other",
    description: "",
  });

  const handleSubmit = async () => {
    await createDate.mutateAsync({
      team_id: teamId,
      title: formData.title,
      date_value: formData.date_value,
      date_type: formData.date_type,
      description: formData.description || null,
      is_recurring: false,
    });
    setIsOpen(false);
    setFormData({
      title: "",
      date_value: "",
      date_type: "other",
      description: "",
    });
  };

  // Sort dates chronologically
  const sortedDates = [...dates].sort(
    (a, b) => new Date(a.date_value).getTime() - new Date(b.date_value).getTime()
  );

  // Separate past and upcoming dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingDates = sortedDates.filter((d) => new Date(d.date_value) >= today);
  const pastDates = sortedDates.filter((d) => new Date(d.date_value) < today);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Important Dates
          </CardTitle>
          <CardDescription>Key dates for the team</CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Date
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Important Date</DialogTitle>
              <DialogDescription>Add a key date for this team</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., First Practice"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date_value}
                    onChange={(e) => setFormData({ ...formData, date_value: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.date_type}
                    onValueChange={(value: typeof formData.date_type) =>
                      setFormData({ ...formData, date_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="practice_start">Practice Start</SelectItem>
                      <SelectItem value="season_start">Season Start</SelectItem>
                      <SelectItem value="season_end">Season End</SelectItem>
                      <SelectItem value="tournament">Tournament</SelectItem>
                      <SelectItem value="tryout">Tryout</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.title || !formData.date_value}>
                Add Date
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : dates.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No important dates set</p>
        ) : (
          <div className="space-y-4">
            {upcomingDates.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Upcoming</h4>
                <div className="space-y-2">
                  {upcomingDates.map((date) => (
                    <div
                      key={date.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[50px]">
                          <p className="text-lg font-bold">{format(new Date(date.date_value), "d")}</p>
                          <p className="text-xs text-muted-foreground uppercase">
                            {format(new Date(date.date_value), "MMM")}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{date.title}</p>
                          <Badge className={dateTypeColors[date.date_type]}>
                            {dateTypeLabels[date.date_type]}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDate.mutate({ id: date.id, teamId })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {pastDates.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Past</h4>
                <div className="space-y-2">
                  {pastDates.map((date) => (
                    <div
                      key={date.id}
                      className="flex items-center justify-between p-3 border rounded-lg opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[50px]">
                          <p className="text-lg font-bold">{format(new Date(date.date_value), "d")}</p>
                          <p className="text-xs text-muted-foreground uppercase">
                            {format(new Date(date.date_value), "MMM")}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{date.title}</p>
                          <Badge className={dateTypeColors[date.date_type]}>
                            {dateTypeLabels[date.date_type]}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDate.mutate({ id: date.id, teamId })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
