import { useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVenues } from "@/hooks/useVenues";
import {
  useAllVenueFields,
  useVenueFieldMutations,
  useBulkUpdateFieldStatus,
} from "@/hooks/useVenueFields";
import { MapPin, Plus, Search, Pencil, CircleCheck, CircleX, AlertTriangle } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CircleCheck }> = {
  open: { label: "Open", color: "bg-emerald-500/15 text-emerald-700 border-emerald-300", icon: CircleCheck },
  closed: { label: "Closed", color: "bg-destructive/15 text-destructive border-destructive/30", icon: CircleX },
  maintenance: { label: "Maintenance", color: "bg-yellow-500/15 text-yellow-700 border-yellow-400", icon: AlertTriangle },
};

const Venues = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmBulk, setConfirmBulk] = useState<string | null>(null);

  const { data: venues = [] } = useVenues({});
  const { data: allFields = [], isLoading } = useAllVenueFields();
  const { updateField } = useVenueFieldMutations();
  const bulkUpdate = useBulkUpdateFieldStatus();

  // Stats
  const openCount = allFields.filter((f) => f.status === "open").length;
  const closedCount = allFields.filter((f) => f.status === "closed").length;
  const maintCount = allFields.filter((f) => f.status === "maintenance").length;

  // Group fields by venue
  const venueMap = new Map<string, typeof allFields>();
  allFields.forEach((field) => {
    const list = venueMap.get(field.venue_id) || [];
    list.push(field);
    venueMap.set(field.venue_id, list);
  });

  // Filter venues
  const filteredVenues = venues.filter((v) => {
    if (search) {
      const q = search.toLowerCase();
      if (!v.name.toLowerCase().includes(q) && !(v.city || "").toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== "all") {
      const fields = venueMap.get(v.id) || [];
      if (!fields.some((f) => f.status === statusFilter)) return false;
    }
    return true;
  });

  const handleStatusChange = (fieldId: string, newStatus: string) => {
    updateField.mutate({ id: fieldId, updates: { status: newStatus } });
  };

  const handleNotesBlur = (fieldId: string, notes: string) => {
    updateField.mutate({ id: fieldId, updates: { notes: notes || null } });
  };

  const handleBulkAction = (status: string) => {
    if (confirmBulk === status) {
      const ids = allFields.map((f) => f.id);
      bulkUpdate.mutate({ fieldIds: ids, status });
      setConfirmBulk(null);
    } else {
      setConfirmBulk(status);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Facility Management</h1>
            <p className="text-muted-foreground">Manage field statuses and locations</p>
          </div>
          <Link to="/admin/facilities/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Facility
            </Button>
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-700">Open</CardTitle>
              <CircleCheck className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700">{openCount}</div>
            </CardContent>
          </Card>
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Closed</CardTitle>
              <CircleX className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{closedCount}</div>
            </CardContent>
          </Card>
          <Card className="border-yellow-300 bg-yellow-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Maintenance</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-700">{maintCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions */}
        <div className="flex gap-3 items-center">
          <span className="text-sm font-medium text-muted-foreground">Bulk:</span>
          <Button
            variant={confirmBulk === "open" ? "default" : "outline"}
            size="sm"
            onClick={() => handleBulkAction("open")}
            disabled={bulkUpdate.isPending}
          >
            {confirmBulk === "open" ? `Confirm: Set All ${allFields.length} Open` : "Set All Open"}
          </Button>
          <Button
            variant={confirmBulk === "closed" ? "destructive" : "outline"}
            size="sm"
            onClick={() => handleBulkAction("closed")}
            disabled={bulkUpdate.isPending}
          >
            {confirmBulk === "closed" ? `Confirm: Set All ${allFields.length} Closed` : "Set All Closed"}
          </Button>
          {confirmBulk && (
            <Button variant="ghost" size="sm" onClick={() => setConfirmBulk(null)}>
              Cancel
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by facility name or city..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Venue Cards with Fields */}
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">Loading fields...</CardContent>
          </Card>
        ) : filteredVenues.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">No facilities found</CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredVenues.map((venue) => {
              const fields = (venueMap.get(venue.id) || []).filter(
                (f) => statusFilter === "all" || f.status === statusFilter
              );

              return (
                <Card key={venue.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-lg">{venue.name}</CardTitle>
                        {venue.city && (
                          <span className="text-sm text-muted-foreground">
                            — {venue.city}, {venue.state}
                          </span>
                        )}
                      </div>
                      <Link to={`/admin/facilities/${venue.id}`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {fields.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">No fields match the current filter.</p>
                    ) : (
                      <div className="divide-y">
                        {fields.map((field) => {
                          const cfg = STATUS_CONFIG[field.status] || STATUS_CONFIG.open;
                          const showNotes = field.status !== "open";

                          return (
                            <div
                              key={field.id}
                              className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                            >
                              {/* Field name */}
                              <div className="min-w-[140px]">
                                <span className="font-medium text-sm">
                                  {field.field_name || `Field ${field.field_number}`}
                                </span>
                              </div>

                              {/* Divisions */}
                              <div className="flex-1 flex gap-1 flex-wrap">
                                {(field.divisions || []).map((d) => (
                                  <Badge key={d} variant="outline" className="text-xs">
                                    {d}
                                  </Badge>
                                ))}
                              </div>

                              {/* Inline notes for closed/maintenance */}
                              {showNotes && (
                                <Input
                                  className="max-w-[180px] h-8 text-xs"
                                  placeholder="Add note..."
                                  defaultValue={field.notes || ""}
                                  onBlur={(e) => handleNotesBlur(field.id, e.target.value)}
                                />
                              )}

                              {/* Status selector */}
                              <Select
                                value={field.status}
                                onValueChange={(val) => handleStatusChange(field.id, val)}
                              >
                                <SelectTrigger className={`w-[140px] h-8 text-xs font-medium border ${cfg.color}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">
                                    <span className="flex items-center gap-1.5">
                                      <CircleCheck className="h-3.5 w-3.5 text-emerald-600" /> Open
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="closed">
                                    <span className="flex items-center gap-1.5">
                                      <CircleX className="h-3.5 w-3.5 text-destructive" /> Closed
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="maintenance">
                                    <span className="flex items-center gap-1.5">
                                      <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" /> Maintenance
                                    </span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Venues;
