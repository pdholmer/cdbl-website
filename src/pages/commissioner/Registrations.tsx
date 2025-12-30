import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, Search, Filter, Eye } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePlayers } from "@/hooks/usePlayers";
import { usePlayerMutations } from "@/hooks/usePlayerMutations";
import { useCommissionerAssignments } from "@/hooks/useCommissionerAssignments";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";

export default function CommissionerRegistrations() {
  const { data: assignments } = useCommissionerAssignments();
  const { data: players, isLoading } = usePlayers();
  const { updatePlayer } = usePlayerMutations();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  const programIds = assignments?.map(a => a.program_id) || [];

  const filteredPlayers = players?.filter(p => {
    if (!programIds.includes(p.program_id || '')) return false;
    if (statusFilter && statusFilter !== "all" && p.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        p.first_name.toLowerCase().includes(query) ||
        p.last_name.toLowerCase().includes(query) ||
        p.parent_email.toLowerCase().includes(query)
      );
    }
    return true;
  }) || [];

  const handleApprove = async (playerId: string) => {
    try {
      await updatePlayer.mutateAsync({
        id: playerId,
        updates: { status: 'registered' },
      });
      toast.success("Registration approved");
    } catch (error) {
      toast.error("Failed to approve registration");
    }
  };

  const handleReject = async (playerId: string) => {
    try {
      await updatePlayer.mutateAsync({
        id: playerId,
        updates: { status: 'rejected' },
      });
      toast.success("Registration rejected");
    } catch (error) {
      toast.error("Failed to reject registration");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "registered":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case "waitlist":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Waitlist</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registrations</h1>
        <p className="text-muted-foreground">
          Review and manage player registrations
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="registered">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="waitlist">Waitlist</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Player Registrations</CardTitle>
          <CardDescription>
            {filteredPlayers.length} registration(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Parent/Guardian</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlayers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No registrations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className="font-medium">{player.first_name} {player.last_name}</div>
                      <div className="text-sm text-muted-foreground">{player.gender}</div>
                    </TableCell>
                    <TableCell>{calculateAge(player.date_of_birth)}</TableCell>
                    <TableCell>
                      <div>{player.parent_guardian_name}</div>
                      <div className="text-sm text-muted-foreground">{player.parent_email}</div>
                    </TableCell>
                    <TableCell>
                      {player.registration_date 
                        ? format(new Date(player.registration_date), 'MMM d, yyyy')
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>{getStatusBadge(player.status || 'pending')}</TableCell>
                    <TableCell>
                      <Badge variant={player.payment_status === 'paid' ? 'default' : 'outline'}>
                        {player.payment_status || 'unpaid'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPlayer(player)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {player.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleApprove(player.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleReject(player.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
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

      {/* Player Details Modal */}
      <Dialog open={!!selectedPlayer} onOpenChange={() => setSelectedPlayer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Player Details</DialogTitle>
            <DialogDescription>
              Registration information for {selectedPlayer?.first_name} {selectedPlayer?.last_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlayer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p>{selectedPlayer.first_name} {selectedPlayer.last_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                  <p>{format(new Date(selectedPlayer.date_of_birth), 'MMMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p>{calculateAge(selectedPlayer.date_of_birth)} years old</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <p>{selectedPlayer.gender || 'Not specified'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Parent/Guardian</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p>{selectedPlayer.parent_guardian_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{selectedPlayer.parent_email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p>{selectedPlayer.parent_phone}</p>
                  </div>
                </div>
              </div>

              {selectedPlayer.address_line1 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Address</h4>
                  <p>{selectedPlayer.address_line1}</p>
                  {selectedPlayer.address_line2 && <p>{selectedPlayer.address_line2}</p>}
                  <p>{selectedPlayer.city}, {selectedPlayer.state} {selectedPlayer.zip_code}</p>
                </div>
              )}

              {(selectedPlayer.medical_notes || selectedPlayer.allergies || selectedPlayer.special_requests) && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Additional Information</h4>
                  {selectedPlayer.medical_notes && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Medical Notes</p>
                      <p>{selectedPlayer.medical_notes}</p>
                    </div>
                  )}
                  {selectedPlayer.allergies && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Allergies</p>
                      <p>{selectedPlayer.allergies}</p>
                    </div>
                  )}
                  {selectedPlayer.special_requests && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Special Requests</p>
                      <p>{selectedPlayer.special_requests}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedPlayer?.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleReject(selectedPlayer.id);
                    setSelectedPlayer(null);
                  }}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    handleApprove(selectedPlayer.id);
                    setSelectedPlayer(null);
                  }}
                >
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
