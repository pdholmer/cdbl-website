import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCommitteeTasks,
  useCommitteeTaskMutations,
  COMMITTEE_LABELS,
  STATUS_LABELS,
  PRIORITY_LABELS,
  type CommitteeType,
  type TaskStatus,
  type TaskPriority,
  type CommitteeTask,
} from "@/hooks/useCommitteeTasks";
import { useUsers } from "@/hooks/useUsers";
import { Plus, CheckCircle2, Clock, AlertCircle, Ban, X } from "lucide-react";
import { format } from "date-fns";

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-slate-500" />,
  in_progress: <Clock className="h-4 w-4 text-blue-500" />,
  completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  cancelled: <X className="h-4 w-4 text-red-500" />,
  blocked: <Ban className="h-4 w-4 text-orange-500" />,
};

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const CommitteeTasks = () => {
  const [selectedCommittee, setSelectedCommittee] = useState<CommitteeType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "active" | "all">("active");
  const [isOpen, setIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CommitteeTask | null>(null);

  const filters = {
    committee: selectedCommittee === "all" ? undefined : selectedCommittee,
    status: statusFilter === "all" || statusFilter === "active" ? undefined : statusFilter,
  };

  const { data: tasks = [], isLoading } = useCommitteeTasks(filters);
  const { data: users = [] } = useUsers();
  const { createTask, updateTask, deleteTask } = useCommitteeTaskMutations();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    committee: "board" as CommitteeType,
    priority: "medium" as TaskPriority,
    due_date: "",
    assigned_to: "",
    notes: "",
  });

  // Filter active tasks if that filter is selected
  const filteredTasks = statusFilter === "active"
    ? tasks.filter((t) => t.status !== "completed" && t.status !== "cancelled")
    : tasks;

  // Group tasks by committee for the overview
  const tasksByCommittee = filteredTasks.reduce((acc, task) => {
    if (!acc[task.committee]) acc[task.committee] = [];
    acc[task.committee].push(task);
    return acc;
  }, {} as Record<CommitteeType, CommitteeTask[]>);

  const handleSubmit = async () => {
    const taskData = {
      title: formData.title,
      description: formData.description || null,
      committee: formData.committee,
      status: "pending" as TaskStatus,
      priority: formData.priority,
      due_date: formData.due_date || null,
      assigned_to: formData.assigned_to || null,
      notes: formData.notes || null,
      completed_at: null,
      created_by: null,
    };

    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, ...taskData });
    } else {
      await createTask.mutateAsync(taskData);
    }
    resetForm();
  };

  const resetForm = () => {
    setIsOpen(false);
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      committee: "board",
      priority: "medium",
      due_date: "",
      assigned_to: "",
      notes: "",
    });
  };

  const handleEdit = (task: CommitteeTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      committee: task.committee,
      priority: task.priority,
      due_date: task.due_date || "",
      assigned_to: task.assigned_to || "",
      notes: task.notes || "",
    });
    setIsOpen(true);
  };

  const handleStatusChange = async (task: CommitteeTask, newStatus: TaskStatus) => {
    await updateTask.mutateAsync({ id: task.id, status: newStatus });
  };

  // Stats
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
    overdue: tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed" && t.status !== "cancelled").length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Committee Tasks</h1>
            <p className="text-muted-foreground">Track and manage tasks across all committees</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsOpen(true); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingTask ? "Edit Task" : "Create Task"}</DialogTitle>
                <DialogDescription>
                  {editingTask ? "Update task details" : "Add a new task for a committee"}
                </DialogDescription>
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
                    <Label>Committee *</Label>
                    <Select
                      value={formData.committee}
                      onValueChange={(value: CommitteeType) =>
                        setFormData({ ...formData, committee: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COMMITTEE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: TaskPriority) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
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
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.display_name || user.email}
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
                    placeholder="Task description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Internal notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.title}>
                  {editingTask ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.blocked}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="w-[200px]">
                <Select
                  value={selectedCommittee}
                  onValueChange={(value) => setSelectedCommittee(value as CommitteeType | "all")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Committees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Committees</SelectItem>
                    {Object.entries(COMMITTEE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[200px]">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as TaskStatus | "active" | "all")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">Status</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Committee</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No tasks found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => {
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed" && task.status !== "cancelled";
                  return (
                    <TableRow key={task.id} className={isOverdue ? "bg-red-50" : ""}>
                      <TableCell>{statusIcons[task.status]}</TableCell>
                      <TableCell>
                        <div>
                          <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{COMMITTEE_LABELS[task.committee]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[task.priority]}>
                          {PRIORITY_LABELS[task.priority]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {task.due_date ? (
                          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                            {format(new Date(task.due_date), "MMM d, yyyy")}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {task.assignee?.display_name || task.assignee?.email || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Select
                            value={task.status}
                            onValueChange={(value: TaskStatus) => handleStatusChange(task, value)}
                          >
                            <SelectTrigger className="h-8 w-[110px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>
                            Edit
                          </Button>
                        </div>
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

export default CommitteeTasks;
