import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  useRegistrationCode, 
  useCreateRegistrationCode, 
  useUpdateRegistrationCode,
  generateRandomCode,
  RegistrationCodeInsert
} from '@/hooks/useRegistrationCodes';
import { useAllPrograms } from '@/hooks/useAllPrograms';

export default function RegistrationCodeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = id === 'new';
  
  const { data: existingCode, isLoading: isLoadingCode } = useRegistrationCode(isNew ? undefined : id);
  const { programs } = useAllPrograms();
  const createCode = useCreateRegistrationCode();
  const updateCode = useUpdateRegistrationCode();

  const [formData, setFormData] = useState<RegistrationCodeInsert>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    program_id: undefined,
    division_id: undefined,
    max_uses: undefined,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: undefined,
    is_active: true,
  });

  // Load existing code data
  useEffect(() => {
    if (existingCode) {
      setFormData({
        code: existingCode.code,
        description: existingCode.description || '',
        discount_type: existingCode.discount_type,
        discount_value: existingCode.discount_value,
        program_id: existingCode.program_id || undefined,
        division_id: existingCode.division_id || undefined,
        max_uses: existingCode.max_uses || undefined,
        valid_from: existingCode.valid_from.split('T')[0],
        valid_until: existingCode.valid_until?.split('T')[0] || undefined,
        is_active: existingCode.is_active,
      });
    }
  }, [existingCode]);

  const handleGenerateCode = () => {
    setFormData(prev => ({ ...prev, code: generateRandomCode() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code) {
      toast({ title: 'Error', description: 'Code is required', variant: 'destructive' });
      return;
    }

    try {
      if (isNew) {
        await createCode.mutateAsync(formData);
        toast({ title: 'Success', description: 'Registration code created' });
      } else {
        await updateCode.mutateAsync({ id: id!, ...formData });
        toast({ title: 'Success', description: 'Registration code updated' });
      }
      navigate('/admin/registration-codes');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  // Get divisions for selected program
  const selectedProgram = programs?.find(p => p.id === formData.program_id);
  const divisions = selectedProgram?.divisions || [];

  if (!isNew && isLoadingCode) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/registration-codes')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isNew ? 'Create Registration Code' : 'Edit Registration Code'}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? 'Create a new promotional or discount code' : 'Update code settings'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Code Details</CardTitle>
              <CardDescription>Configure the registration code settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="SUMMER2025"
                    className="font-mono"
                  />
                  <Button type="button" variant="outline" onClick={handleGenerateCode}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description for internal reference..."
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="discount_type">Discount Type *</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      discount_type: value as 'percentage' | 'fixed' | 'free',
                      discount_value: value === 'free' ? 100 : prev.discount_value
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Off</SelectItem>
                      <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                      <SelectItem value="free">Free Registration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.discount_type !== 'free' && (
                  <div className="space-y-2">
                    <Label htmlFor="discount_value">
                      {formData.discount_type === 'percentage' ? 'Percentage' : 'Amount'} *
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                      min={0}
                      max={formData.discount_type === 'percentage' ? 100 : undefined}
                    />
                  </div>
                )}
              </div>

              {/* Program & Division Restrictions */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="program">Restrict to Program</Label>
                  <Select
                    value={formData.program_id || 'all'}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      program_id: value === 'all' ? undefined : value,
                      division_id: undefined
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Programs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Programs</SelectItem>
                      {programs?.map(program => (
                        <SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="division">Restrict to Division</Label>
                  <Select
                    value={formData.division_id || 'all'}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      division_id: value === 'all' ? undefined : value 
                    }))}
                    disabled={!formData.program_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Divisions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Divisions</SelectItem>
                      {divisions.map((division: any) => (
                        <SelectItem key={division.id} value={division.id}>
                          {division.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Usage Limits */}
              <div className="space-y-2">
                <Label htmlFor="max_uses">Maximum Uses (leave empty for unlimited)</Label>
                <Input
                  id="max_uses"
                  type="number"
                  value={formData.max_uses || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    max_uses: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  min={1}
                  placeholder="Unlimited"
                />
              </div>

              {/* Validity Dates */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Valid From *</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valid_until">Valid Until (leave empty for no expiry)</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      valid_until: e.target.value || undefined 
                    }))}
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active">Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Only active codes can be used during registration
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => navigate('/admin/registration-codes')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCode.isPending || updateCode.isPending}>
                  {(createCode.isPending || updateCode.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isNew ? 'Create Code' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AdminLayout>
  );
}
