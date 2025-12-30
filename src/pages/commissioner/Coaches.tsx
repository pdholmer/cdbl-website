import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Mail, MoreHorizontal, RefreshCw, X } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCoaches } from "@/hooks/useCoaches";
import { 
  useCoachInvitations, 
  useCreateCoachInvitation, 
  useCancelCoachInvitation,
  useResendCoachInvitation 
} from "@/hooks/useCoachInvitations";
import { useCommissionerAssignments } from "@/hooks/useCommissionerAssignments";
import { usePrograms } from "@/hooks/usePrograms";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CommissionerCoaches() {
  const { data: assignments } = useCommissionerAssignments();
  const { data: coaches, isLoading: coachesLoading } = useCoaches();
  const { data: invitations, isLoading: invitationsLoading } = useCoachInvitations();
  const { programs } = usePrograms();
  const createInvitation = useCreateCoachInvitation();
  const cancelInvitation = useCancelCoachInvitation();
  const resendInvitation = useResendCoachInvitation();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [newInvite, setNewInvite] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    program_id: "",
    division_id: "",
  });

  const programIds = assignments?.map(a => a.program_id) || [];
  const assignedPrograms = programs?.filter(p => programIds.includes(p.id)) || [];

  const filteredCoaches = coaches?.filter(c => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        c.first_name.toLowerCase().includes(query) ||
        c.last_name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
      );
    }
    return true;
  }) || [];

  const filteredInvitations = invitations?.filter(i => {
    if (!programIds.includes(i.program_id || '')) return false;
    return true;
  }) || [];

  const handleCreateInvitation = async () => {
    if (!newInvite.email || !newInvite.first_name || !newInvite.last_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createInvitation.mutateAsync({
        email: newInvite.email,
        first_name: newInvite.first_name,
        last_name: newInvite.last_name,
        phone: newInvite.phone || undefined,
        program_id: newInvite.program_id || undefined,
        division_id: newInvite.division_id || undefined,
      });
      setShowInviteDialog(false);
      setNewInvite({
        email: "",
        first_name: "",
        last_name: "",
        phone: "",
        program_id: "",
        division_id: "",
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case "expired":
        return <Badge variant="secondary">Expired</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBackgroundCheckBadge = (status: string | null) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  const selectedProgram = assignedPrograms.find(p => p.id === newInvite.program_id);
  const availableDivisions = selectedProgram?.divisions || [];

  const isLoading = coachesLoading || invitationsLoading;

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
          <h1 className="text-3xl font-bold tracking-tight">Coaches</h1>
          <p className="text-muted-foreground">
            Manage coaches and send invitations
          </p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Invite Coach
        </Button>
      </div>

      <Tabs defaultValue="coaches">
        <TabsList>
          <TabsTrigger value="coaches">Active Coaches</TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations
            {filteredInvitations.filter(i => i.status === 'pending').length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filteredInvitations.filter(i => i.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coaches" className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search coaches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Coaches Table */}
          <Card>
            <CardHeader>
              <CardTitle>League Coaches</CardTitle>
              <CardDescription>
                {filteredCoaches.length} coach(es) found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Background Check</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoaches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No coaches found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCoaches.map((coach) => (
                      <TableRow key={coach.id}>
                        <TableCell>
                          <div className="font-medium">{coach.first_name} {coach.last_name}</div>
                        </TableCell>
                        <TableCell>
                          <div>{coach.email}</div>
                          <div className="text-sm text-muted-foreground">{coach.phone}</div>
                        </TableCell>
                        <TableCell>
                          {getBackgroundCheckBadge(coach.background_check_status)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={coach.status === 'active' ? 'default' : 'secondary'}>
                            {coach.status || 'active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`mailto:${coach.email}`}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coach Invitations</CardTitle>
              <CardDescription>
                Track and manage coach invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvitations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No invitations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>
                          <div className="font-medium">
                            {invitation.first_name} {invitation.last_name}
                          </div>
                        </TableCell>
                        <TableCell>{invitation.email}</TableCell>
                        <TableCell>
                          {invitation.program?.name || 'N/A'}
                          {invitation.division && (
                            <div className="text-sm text-muted-foreground">
                              {invitation.division.name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invitation.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                        <TableCell className="text-right">
                          {invitation.status === 'pending' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => resendInvitation.mutate(invitation.id)}
                                >
                                  <RefreshCw className="mr-2 h-4 w-4" />
                                  Resend
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => cancelInvitation.mutate(invitation.id)}
                                  className="text-destructive"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Coach Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Coach</DialogTitle>
            <DialogDescription>
              Send an invitation to a new coach
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={newInvite.first_name}
                  onChange={(e) => setNewInvite({ ...newInvite, first_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={newInvite.last_name}
                  onChange={(e) => setNewInvite({ ...newInvite, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newInvite.email}
                onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={newInvite.phone}
                onChange={(e) => setNewInvite({ ...newInvite, phone: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="program">Program</Label>
              <Select 
                value={newInvite.program_id} 
                onValueChange={(value) => setNewInvite({ ...newInvite, program_id: value, division_id: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select program (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {assignedPrograms.map((program) => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newInvite.program_id && availableDivisions.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="division">Division</Label>
                <Select 
                  value={newInvite.division_id} 
                  onValueChange={(value) => setNewInvite({ ...newInvite, division_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select division (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDivisions.map((division: any) => (
                      <SelectItem key={division.id} value={division.id}>
                        {division.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvitation} disabled={createInvitation.isPending}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
