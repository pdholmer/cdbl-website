import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Search, Loader2, Tag, Copy, Check, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRegistrationCodes, useDeleteRegistrationCode, RegistrationCode } from '@/hooks/useRegistrationCodes';

const getDiscountDisplay = (code: RegistrationCode): string => {
  switch (code.discount_type) {
    case 'free':
      return 'FREE';
    case 'percentage':
      return `${code.discount_value}% OFF`;
    case 'fixed':
      return `$${code.discount_value} OFF`;
    default:
      return '-';
  }
};

const getStatusBadge = (code: RegistrationCode) => {
  if (!code.is_active) {
    return <Badge variant="secondary">Inactive</Badge>;
  }
  
  const now = new Date();
  const validFrom = new Date(code.valid_from);
  const validUntil = code.valid_until ? new Date(code.valid_until) : null;
  
  if (validFrom > now) {
    return <Badge variant="outline">Scheduled</Badge>;
  }
  
  if (validUntil && validUntil < now) {
    return <Badge variant="secondary">Expired</Badge>;
  }
  
  if (code.max_uses && code.current_uses >= code.max_uses) {
    return <Badge variant="secondary">Maxed Out</Badge>;
  }
  
  return <Badge variant="default">Active</Badge>;
};

export default function RegistrationCodes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: codes, isLoading } = useRegistrationCodes();
  const deleteCode = useDeleteRegistrationCode();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredCodes = codes?.filter(code => 
    code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    code.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({ title: 'Copied', description: 'Code copied to clipboard' });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCode.mutateAsync(id);
      toast({ title: 'Success', description: 'Registration code deleted' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const stats = {
    total: codes?.length || 0,
    active: codes?.filter(c => c.is_active && (!c.valid_until || new Date(c.valid_until) > new Date())).length || 0,
    totalUses: codes?.reduce((sum, c) => sum + c.current_uses, 0) || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Registration Codes</h1>
            <p className="text-muted-foreground">Manage promotional and discount codes for registration</p>
          </div>
          <Button onClick={() => navigate('/admin/registration-codes/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Code
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Codes</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Codes</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUses}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Codes Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Codes</CardTitle>
            <CardDescription>
              {filteredCodes.length} code{filteredCodes.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredCodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No registration codes found. Create one to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Program/Division</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Valid Until</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodes.map((code) => (
                    <TableRow 
                      key={code.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/admin/registration-codes/${code.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold">{code.code}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(code.code);
                            }}
                          >
                            {copiedCode === code.code ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        {code.description && (
                          <div className="text-sm text-muted-foreground">{code.description}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getDiscountDisplay(code)}</Badge>
                      </TableCell>
                      <TableCell>
                        {code.programs?.name || code.divisions?.name || 'All Programs'}
                      </TableCell>
                      <TableCell>
                        {code.current_uses}
                        {code.max_uses && ` / ${code.max_uses}`}
                      </TableCell>
                      <TableCell>
                        {code.valid_until 
                          ? format(new Date(code.valid_until), 'MMM d, yyyy')
                          : 'No expiry'
                        }
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(code)}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Code</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the code <strong>{code.code}</strong>? 
                                This will also delete all usage history.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(code.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
