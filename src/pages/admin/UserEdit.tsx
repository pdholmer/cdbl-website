import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Save, Trash2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { FeedbackStatusBadge } from '@/components/feedback/FeedbackStatusBadge';
import { FeedbackTypeBadge } from '@/components/feedback/FeedbackTypeBadge';

const AVAILABLE_ROLES = ['admin', 'moderator', 'user', 'coach', 'commissioner'];

export default function UserEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useUser(id);
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [displayName, setDisplayName] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form when user data loads
  if (user && !hasChanges && displayName === '') {
    setDisplayName(user.display_name || '');
    setSelectedRoles(user.roles);
  }

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
    setHasChanges(true);
  };

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      await updateUser.mutateAsync({
        userId: id,
        display_name: displayName,
        roles: selectedRoles,
      });
      toast({ title: 'Success', description: 'User updated successfully' });
      setHasChanges(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteUser.mutateAsync(id);
      toast({ title: 'Success', description: 'User deleted successfully' });
      navigate('/admin/users');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !user) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center text-destructive">
              {error?.message || 'User not found'}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/users')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {user.display_name || user.email}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateUser.isPending}
            >
              {updateUser.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Info */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage user profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => handleDisplayNameChange(e.target.value)}
                    placeholder="Enter display name"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Joined:</span>{' '}
                  {format(new Date(user.created_at), 'PPP')}
                </div>
                <div>
                  <span className="text-muted-foreground">Last active:</span>{' '}
                  {user.last_sign_in_at 
                    ? format(new Date(user.last_sign_in_at), 'PPP')
                    : 'Never'
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
              <CardDescription>Assign user permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {AVAILABLE_ROLES.map(role => (
                  <div key={role} className="flex items-center space-x-3">
                    <Checkbox
                      id={`role-${role}`}
                      checked={selectedRoles.includes(role)}
                      onCheckedChange={() => handleRoleToggle(role)}
                    />
                    <label
                      htmlFor={`role-${role}`}
                      className="text-sm font-medium capitalize cursor-pointer flex-1"
                    >
                      {role}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Feedback History
              </CardTitle>
              <CardDescription>
                {user.feedback_count} feedback item{user.feedback_count !== 1 ? 's' : ''} submitted
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {user.feedback && user.feedback.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {user.feedback.map((fb: any) => (
                    <TableRow
                      key={fb.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/admin/feedback`)}
                    >
                      <TableCell className="font-medium">{fb.subject}</TableCell>
                      <TableCell>
                        <FeedbackTypeBadge type={fb.feedback_type} />
                      </TableCell>
                      <TableCell>
                        <FeedbackStatusBadge status={fb.status} />
                      </TableCell>
                      <TableCell>
                        {format(new Date(fb.created_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No feedback submitted by this user.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the user account for <strong>{user.email}</strong>.
                    This action cannot be undone. All user data including feedback will be removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteUser.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Delete User
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
