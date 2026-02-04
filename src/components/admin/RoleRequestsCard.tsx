import { useState } from 'react';
import { format } from 'date-fns';
import { Check, X, Loader2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRoleRequests, useApproveRoleRequest, useRejectRoleRequest, RoleRequest } from '@/hooks/useRoleRequests';

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

export function RoleRequestsCard() {
  const { toast } = useToast();
  const { data: requests, isLoading } = useRoleRequests('pending');
  const approveRequest = useApproveRoleRequest();
  const rejectRequest = useRejectRoleRequest();
  
  const [actionDialog, setActionDialog] = useState<{
    type: 'approve' | 'reject';
    request: RoleRequest;
  } | null>(null);
  const [notes, setNotes] = useState('');

  const handleAction = async () => {
    if (!actionDialog) return;
    
    try {
      if (actionDialog.type === 'approve') {
        await approveRequest.mutateAsync({ 
          requestId: actionDialog.request.id, 
          notes: notes || undefined 
        });
        toast({ title: 'Success', description: 'Role request approved' });
      } else {
        await rejectRequest.mutateAsync({ 
          requestId: actionDialog.request.id, 
          notes: notes || undefined 
        });
        toast({ title: 'Success', description: 'Role request rejected' });
      }
      setActionDialog(null);
      setNotes('');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const pendingCount = requests?.length || 0;

  if (pendingCount === 0 && !isLoading) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Pending Role Requests
            </CardTitle>
            <CardDescription>
              Review and approve user role upgrade requests
            </CardDescription>
          </div>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {pendingCount}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Requested Role</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests?.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {request.profiles?.display_name || request.profiles?.email?.split('@')[0] || 'Unknown'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.profiles?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(request.requested_role)} className="capitalize">
                        {request.requested_role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {request.reason || <span className="text-muted-foreground">No reason provided</span>}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.requested_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActionDialog({ type: 'approve', request })}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActionDialog({ type: 'reject', request })}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={actionDialog !== null} onOpenChange={(open) => !open && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === 'approve' ? 'Approve' : 'Reject'} Role Request
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.type === 'approve' 
                ? `This will grant ${actionDialog?.request.profiles?.display_name || actionDialog?.request.profiles?.email} the ${actionDialog?.request.requested_role.replace('_', ' ')} role.`
                : `This will reject the request for ${actionDialog?.request.requested_role.replace('_', ' ')} role.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Add optional notes for the user..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button 
              variant={actionDialog?.type === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={approveRequest.isPending || rejectRequest.isPending}
            >
              {(approveRequest.isPending || rejectRequest.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {actionDialog?.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
