import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useCoaches, type CoachFilters } from "@/hooks/useCoaches";
import { UserPlus, Search, Users, Shield, AlertCircle } from "lucide-react";

const Coaches = () => {
  const [filters, setFilters] = useState<CoachFilters>({});
  const { data: coaches = [], isLoading } = useCoaches(filters);

  const stats = {
    total: coaches.length,
    active: coaches.filter((c) => c.status === "active").length,
    backgroundChecksExpiring: coaches.filter(
      (c) =>
        c.background_check_expiry &&
        new Date(c.background_check_expiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    ).length,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      suspended: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getBackgroundCheckBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      approved: "default",
      pending: "secondary",
      expired: "destructive",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status || "not started"}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Coach Management</h1>
            <p className="text-muted-foreground">Manage coaches and volunteers</p>
          </div>
          <Link to="/admin/coaches/new">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Coach
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Coaches</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Coaches</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Background Checks Expiring</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.backgroundChecksExpiring}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Search and filter coaches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-8"
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value === "all" ? undefined : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.background_check_status || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    background_check_status: value === "all" ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Background Checks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Background Checks</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Teams</TableHead>
                <TableHead>Background Check</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : coaches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No coaches found
                  </TableCell>
                </TableRow>
              ) : (
                coaches.map((coach) => (
                  <TableRow key={coach.id}>
                    <TableCell className="font-medium">
                      {coach.first_name} {coach.last_name}
                    </TableCell>
                    <TableCell>{coach.email}</TableCell>
                    <TableCell>{coach.phone}</TableCell>
                    <TableCell>
                      {coach.team_coaches?.length || 0} team(s)
                    </TableCell>
                    <TableCell>
                      {getBackgroundCheckBadge(coach.background_check_status || "")}
                    </TableCell>
                    <TableCell>{getStatusBadge(coach.status)}</TableCell>
                    <TableCell>
                      <Link to={`/admin/coaches/${coach.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Coaches;
