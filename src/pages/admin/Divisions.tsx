import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Divisions = () => {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: divisions, isLoading } = useQuery({
    queryKey: ['admin-divisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('divisions')
        .select('*, programs!divisions_program_id_fkey(name)')
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("divisions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-divisions"] });
      toast.success("Division deleted successfully");
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete division");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading divisions...</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manage Divisions</h1>
          <p className="text-muted-foreground">Add, edit, or remove age divisions</p>
        </div>
        <Button asChild>
          <Link to="/admin/divisions/new">
            <Plus className="mr-2 h-4 w-4" /> Add Division
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {divisions?.map((division) => (
          <Card key={division.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{division.name}</CardTitle>
                  <CardDescription>
                    {division.programs?.name} • Ages {division.age_range}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/admin/divisions/${division.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" onClick={() => setDeleteId(division.id)} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-semibold">Cost</p>
                  <p className="text-muted-foreground">${division.cost}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Season Length</p>
                  <p className="text-muted-foreground">{division.season_length || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Display Order</p>
                  <p className="text-muted-foreground">{division.display_order}</p>
                </div>
              </div>
              {division.features && Array.isArray(division.features) && division.features.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">Features</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {division.features.map((feature: string, idx: number) => (
                      <li key={idx}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this division. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mt-8">
        <Button variant="outline" asChild>
          <Link to="/admin">← Back to Dashboard</Link>
        </Button>
      </div>
    </AdminLayout>
  );
};

export default Divisions;