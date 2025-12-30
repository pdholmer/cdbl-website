import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Plus, Calendar, Users, Play, Clock, CheckCircle2, Pause } from "lucide-react";
import { useDrafts } from "@/hooks/useDrafts";
import { usePrograms } from "@/hooks/usePrograms";
import { format } from "date-fns";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "setup":
      return <Badge variant="secondary">Setup</Badge>;
    case "ready":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Ready</Badge>;
    case "in_progress":
      return <Badge className="bg-green-500 hover:bg-green-600">In Progress</Badge>;
    case "paused":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Paused</Badge>;
    case "completed":
      return <Badge variant="outline">Completed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "setup":
      return <Clock className="h-4 w-4" />;
    case "ready":
      return <Calendar className="h-4 w-4" />;
    case "in_progress":
      return <Play className="h-4 w-4" />;
    case "paused":
      return <Pause className="h-4 w-4" />;
    case "completed":
      return <CheckCircle2 className="h-4 w-4" />;
    default:
      return null;
  }
};

export default function Drafts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [programFilter, setProgramFilter] = useState<string>("all");

  const { data: drafts, isLoading } = useDrafts({
    status: statusFilter === "all" ? undefined : statusFilter,
    programId: programFilter === "all" ? undefined : programFilter,
  });
  const { programs } = usePrograms();

  const filteredDrafts = drafts?.filter((draft) =>
    draft.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Summary stats
  const setupCount = drafts?.filter((d) => d.status === "setup").length || 0;
  const readyCount = drafts?.filter((d) => d.status === "ready").length || 0;
  const inProgressCount = drafts?.filter((d) => d.status === "in_progress").length || 0;
  const completedCount = drafts?.filter((d) => d.status === "completed").length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Draft Management</h1>
            <p className="text-muted-foreground">
              Create and manage player drafts for your league
            </p>
          </div>
          <Button asChild>
            <Link to="/admin/drafts/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Draft
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Setup</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{setupCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ready</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readyCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Play className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search drafts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="setup">Setup</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs?.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Drafts Table */}
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Draft Name</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Division</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading drafts...
                    </TableCell>
                  </TableRow>
                ) : filteredDrafts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No drafts found</p>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/admin/drafts/new">Create your first draft</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDrafts?.map((draft) => (
                    <TableRow key={draft.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(draft.status)}
                          <span className="font-medium">{draft.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{draft.program?.name || "-"}</TableCell>
                      <TableCell>{draft.division?.name || "-"}</TableCell>
                      <TableCell>
                        {draft.scheduled_start
                          ? format(new Date(draft.scheduled_start), "MMM d, yyyy h:mm a")
                          : "Not scheduled"}
                      </TableCell>
                      <TableCell>{getStatusBadge(draft.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          Round {draft.current_round} / Pick {draft.current_pick}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {draft.status === "in_progress" && (
                            <Button asChild size="sm" variant="default">
                              <Link to={`/admin/drafts/${draft.id}/live`}>
                                <Play className="h-4 w-4 mr-1" />
                                Live
                              </Link>
                            </Button>
                          )}
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/admin/drafts/${draft.id}`}>
                              {draft.status === "setup" ? "Setup" : "View"}
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
