import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Play, Settings, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDrafts } from "@/hooks/useDrafts";
import { useCommissionerAssignments } from "@/hooks/useCommissionerAssignments";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function CommissionerDrafts() {
  const navigate = useNavigate();
  const { data: assignments } = useCommissionerAssignments();
  const { data: drafts, isLoading } = useDrafts();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const programIds = assignments?.map(a => a.program_id) || [];

  const filteredDrafts = drafts?.filter(d => {
    if (!programIds.includes(d.program_id || '')) return false;
    if (statusFilter && statusFilter !== "all" && d.status !== statusFilter) return false;
    if (searchQuery) {
      return d.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "setup":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Setup</Badge>;
      case "ready":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Ready</Badge>;
      case "in_progress":
        return <Badge className="bg-green-100 text-green-800">In Progress</Badge>;
      case "paused":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Paused</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drafts</h1>
          <p className="text-muted-foreground">
            Create and manage player drafts
          </p>
        </div>
        <Button onClick={() => navigate("/commissioner/drafts/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Draft
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drafts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="setup">Setup</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drafts Table */}
      <Card>
        <CardHeader>
          <CardTitle>League Drafts</CardTitle>
          <CardDescription>
            {filteredDrafts.length} draft(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Draft Name</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrafts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No drafts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDrafts.map((draft) => (
                  <TableRow key={draft.id}>
                    <TableCell>
                      <div className="font-medium">{draft.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {draft.season_year} Season
                      </div>
                    </TableCell>
                    <TableCell>{draft.division?.name || 'All Divisions'}</TableCell>
                    <TableCell>
                      {draft.scheduled_start
                        ? format(new Date(draft.scheduled_start), 'MMM d, yyyy h:mm a')
                        : 'Not scheduled'}
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">View details</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(draft.status || 'setup')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {draft.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/commissioner/drafts/${draft.id}/live`)}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Live
                          </Button>
                        )}
                        {(draft.status === 'setup' || draft.status === 'ready') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/commissioner/drafts/${draft.id}`)}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Setup
                          </Button>
                        )}
                        {draft.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/commissioner/drafts/${draft.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
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
  );
}
