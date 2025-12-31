import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Loader2, Save, Trash2, MessageSquare, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers';
import { FeedbackStatusBadge } from '@/components/feedback/FeedbackStatusBadge';
import { FeedbackTypeBadge } from '@/components/feedback/FeedbackTypeBadge';

const AVAILABLE_ROLES = ['admin', 'moderator', 'user', 'coach', 'commissioner'];

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'destructive';
    case 'commissioner':
      return 'default';
    case 'coach':
      return 'secondary';
    default:
      return 'outline';
  }
};

interface UserDetailSliderProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailSlider({ userId, isOpen, onClose }: UserDetailSliderProps) {
  const { toast } = useToast();
  const { data: user, isLoading, error } = useUser(userId || undefined);
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [displayName, setDisplayName] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || '');
      setSelectedRoles(user.roles);
      setHasChanges(false);
    }
  }, [user]);

  // Reset state when slider closes
  useEffect(() => {
    if (!isOpen) {
      setHasChanges(false);
    }
  }, [isOpen]);

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
    if (!userId) return;

    try {
      await updateUser.mutateAsync({
        userId,
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
    if (!userId) return;

    try {
      await deleteUser.mutateAsync(userId);
      toast({ title: 'Success', description: 'User deleted successfully' });
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error || !user ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-destructive">{error?.message || 'User not found'}</p>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <>
            <SheetHeader className="pb-4">
              <SheetTitle className="pr-8 text-xl">
                {user.display_name || user.email}
              </SheetTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex gap-1 flex-wrap pt-2">
                {user.roles.length > 0 ? (
                  user.roles.map(role => (
                    <Badge key={role} variant={getRoleBadgeVariant(role)} className="capitalize">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">No roles assigned</span>
                )}
              </div>
            </SheetHeader>

            <div className="space-y-6">
              {/* Profile Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Profile Information
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} disabled className="bg-muted" />
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
                <div className="grid grid-cols-2 gap-4 text-sm">
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
              </div>

              <Separator />

              {/* Roles */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Roles
                </h3>
                <div className="grid grid-cols-2 gap-3">
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
              </div>

              <Separator />

              {/* Feedback History */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Feedback History
                  </h3>
                  <Badge variant="secondary" className="ml-auto">
                    {user.feedback_count || 0}
                  </Badge>
                </div>
                {user.feedback && user.feedback.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {user.feedback.map((fb: any) => (
                          <TableRow key={fb.id}>
                            <TableCell className="font-medium text-sm">{fb.subject}</TableCell>
                            <TableCell>
                              <FeedbackTypeBadge type={fb.feedback_type} />
                            </TableCell>
                            <TableCell>
                              <FeedbackStatusBadge status={fb.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No feedback submitted by this user.
                  </p>
                )}
              </div>

              <Separator />

              {/* Danger Zone */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wide text-destructive">
                  Danger Zone
                </h3>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
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
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
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
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
