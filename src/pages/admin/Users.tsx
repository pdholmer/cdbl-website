import { useState, useEffect } from 'react';
import { Users as UsersIcon, Shield, UserCog, Search, Plus, Loader2, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useUsers, useInviteUser, UserProfile } from '@/hooks/useUsers';
import { UserDetailSlider } from '@/components/admin/UserDetailSlider';
import { RoleRequestsCard } from '@/components/admin/RoleRequestsCard';
import { supabase } from '@/integrations/supabase/client';

// All available roles - admin role is conditionally shown based on current user
const ALL_ROLES = ['admin', 'board_member', 'moderator', 'user', 'coach', 'commissioner', 'parent'];

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'destructive';
    case 'board_member':
      return 'default';
    case 'commissioner':
      return 'default';
    case 'coach':
      return 'secondary';
    default:
      return 'outline';
  }
};

export default function Users() {
  const { toast } = useToast();
  const { data: users, isLoading, error } = useUsers();
  const inviteUser = useInviteUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoles, setInviteRoles] = useState<string[]>(['board_member']);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  
  // Slider state - selectedUserId is the single source of truth
  // Slider is open whenever a user is selected
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Check if current user is an admin
  useEffect(() => {
    const checkAdminRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: hasAdminRole } = await supabase
          .rpc('has_role', {
            _user_id: session.user.id,
            _role: 'admin'
          });
        setIsCurrentUserAdmin(!!hasAdminRole);
      }
    };
    checkAdminRole();
  }, []);

  // Available roles based on current user's permissions
  const availableRoles = isCurrentUserAdmin 
    ? ALL_ROLES 
    : ALL_ROLES.filter(role => role !== 'admin');

  const filteredUsers = users?.filter((user: UserProfile) => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
    
    return matchesSearch && matchesRole;
  }) || [];

  const stats = {
    total: users?.length || 0,
    admins: users?.filter((u: UserProfile) => u.roles.includes('admin')).length || 0,
    boardMembers: users?.filter((u: UserProfile) => u.roles.includes('board_member')).length || 0,
    coaches: users?.filter((u: UserProfile) => u.roles.includes('coach')).length || 0,
    parents: users?.filter((u: UserProfile) => u.roles.includes('parent')).length || 0,
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast({ title: 'Error', description: 'Email is required', variant: 'destructive' });
      return;
    }

    try {
      await inviteUser.mutateAsync({ email: inviteEmail, roles: inviteRoles });
      toast({ title: 'Success', description: `Invitation sent to ${inviteEmail}` });
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRoles(['board_member']);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const toggleInviteRole = (role: string) => {
    setInviteRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleRowClick = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleSliderClose = () => {
    setSelectedUserId(null);
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center text-destructive">
              Failed to load users: {error.message}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">Manage user accounts and permissions</p>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Send an invitation email to a new user. They will be assigned as a Board Member by default.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Roles</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableRoles.map(role => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox
                          id={`invite-role-${role}`}
                          checked={inviteRoles.includes(role)}
                          onCheckedChange={() => toggleInviteRole(role)}
                        />
                        <label
                          htmlFor={`invite-role-${role}`}
                          className="text-sm capitalize cursor-pointer"
                        >
                          {role.replace('_', ' ')}
                        </label>
                      </div>
                    ))}
                  </div>
                  {!isCurrentUserAdmin && (
                    <p className="text-xs text-muted-foreground">
                      Note: Only admins can assign the admin role.
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={inviteUser.isPending}>
                  {inviteUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
        </Dialog>
        </div>

        {/* Role Requests Card - Only show if there are pending requests */}
        {isCurrentUserAdmin && <RoleRequestsCard />}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Board Members</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.boardMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coaches</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.coaches}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Parents</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.parents}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {ALL_ROLES.map(role => (
                <SelectItem key={role} value={role} className="capitalize">
                  {role.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
            <CardDescription>
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your criteria.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead className="text-center">Feedback</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: UserProfile) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(user.id)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.display_name || user.email.split('@')[0]}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length > 0 ? (
                            user.roles.map(role => (
                              <Badge key={role} variant={getRoleBadgeVariant(role)} className="capitalize">
                                {role.replace('_', ' ')}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">No roles</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {user.feedback_count > 0 ? (
                          <Badge variant="secondary">{user.feedback_count}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {user.last_sign_in_at 
                          ? format(new Date(user.last_sign_in_at), 'MMM d, yyyy')
                          : <span className="text-muted-foreground">Never</span>
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Detail Slider */}
      <UserDetailSlider 
        userId={selectedUserId}
        isOpen={selectedUserId !== null}
        onClose={handleSliderClose}
        isCurrentUserAdmin={isCurrentUserAdmin}
      />
    </AdminLayout>
  );
}
