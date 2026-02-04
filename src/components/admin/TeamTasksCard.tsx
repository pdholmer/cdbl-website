import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTeamTasks, useTeamTaskMutations, TeamTask } from "@/hooks/useTeamTasks";
import { useCoaches } from "@/hooks/useCoaches";
import { Plus, CheckCircle2, Circle, Clock, X, Flag, Target } from "lucide-react";
import { format } from "date-fns";

interface TeamTasksCardProps {
  teamId: string;
}

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Circle className="h-4 w-4 text-muted-foreground" />,
  in_progress: <Clock className="h-4 w-4 text-blue-500" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  cancelled: <X className="h-4 w-4 text-red-500" />,
};

export function TeamTasksCard({ teamId }: TeamTasksCardProps) {
  const { data: tasks = [], isLoading } = useTeamTasks(teamId);
  const { data: coaches = [] } = useCoaches({ status: "active" });
  const { createTask, updateTask, deleteTask } = useTeamTaskMutations();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    task_type: "task" as "task" | "milestone",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    due_date: "",
    assigned_to: "",
  });

  const handleSubmit = async () => {
    await createTask.mutateAsync({
      team_id: teamId,
      title: formData.title,
      description: formData.description || null,
      task_type: formData.task_type,
      status: "pending",
      priority: formData.priority,
      due_date: formData.due_date || null,
      assigned_to: formData.assigned_to || null,
      completed_at: null,
      created_by: null,
    });
    setIsOpen(false);
    setFormData({
      title: "",
      description: "",
      task_type: "task",
      priority: "medium",
      due_date: "",
      assigned_to: "",
    });
  };

  const handleStatusChange = async (task: TeamTask, newStatus: string) => {
    await updateTask.mutateAsync({
      id: task.id,
      teamId,
      status: newStatus as TeamTask["status"],
      completed_at: newStatus === "completed" ? new Date().toISOString() : null,
    });
  };

  const milestones = tasks.filter((t) => t.task_type === "milestone");
  const regularTasks = tasks.filter((t) => t.task_type === "task");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Tasks & Milestones
          </CardTitle>
          <CardDescription>Track team activities and important milestones</CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Task or Milestone</DialogTitle>
              <DialogDescription>Create a new task or milestone for this team</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.task_type}
                    onValueChange={(value: "task" | "milestone") =>
                      setFormData({ ...formData, task_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: "low" | "medium" | "high" | "urgent") =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select
                    value={formData.assigned_to}
                    onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                  >
                    <SelectTrigger>
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
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
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
              <Button onClick={handleSubmit} disabled={!formData.title}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-6">
        {milestones.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Milestones
            </h4>
            <div className="space-y-2">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {statusIcons[milestone.status]}
                    <div>
                      <p className="font-medium">{milestone.title}</p>
                      {milestone.due_date && (
                        <p className="text-sm text-muted-foreground">
                          Due: {format(new Date(milestone.due_date), "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Select
                    value={milestone.status}
                    onValueChange={(value) => handleStatusChange(milestone, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">Status</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : regularTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No tasks yet
                </TableCell>
              </TableRow>
            ) : (
              regularTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <button onClick={() => handleStatusChange(task, task.status === "completed" ? "pending" : "completed")}>
                      {statusIcons[task.status]}
                    </button>
                  </TableCell>
                  <TableCell className={task.status === "completed" ? "line-through text-muted-foreground" : ""}>
                    {task.title}
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    {task.due_date ? format(new Date(task.due_date), "MMM d") : "-"}
                  </TableCell>
                  <TableCell>
                    {task.coach ? `${task.coach.first_name} ${task.coach.last_name}` : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask.mutate({ id: task.id, teamId })}
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
  );
}
