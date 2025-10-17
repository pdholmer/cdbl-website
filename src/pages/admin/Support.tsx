import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
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

const Support = () => {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: supportOptions, isLoading } = useQuery({
    queryKey: ['admin-support'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_options')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("support_options").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-support"] });
      toast.success("Support option deleted successfully");
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete support option");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading support options...</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage Support Options</h1>
            <p className="text-muted-foreground">Manage donations, sponsors, volunteers, and merchandise</p>
          </div>
          <Button asChild>
            <Link to="/admin/support/new">
              <Plus className="mr-2 h-4 w-4" /> Add Support Option
            </Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {supportOptions?.map((option) => (
            <Card key={option.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{option.title}</CardTitle>
                      <Badge variant={option.active ? "default" : "secondary"}>
                        {option.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{option.type}</Badge>
                    </div>
                    <CardDescription>{option.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/support/${option.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteId(option.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-semibold">Display Order</p>
                    <p className="text-muted-foreground">{option.display_order}</p>
                  </div>
                  {option.cta_text && (
                    <div>
                      <p className="text-sm font-semibold">CTA Text</p>
                      <p className="text-muted-foreground">{option.cta_text}</p>
                    </div>
                  )}
                  {option.cta_link && (
                    <div>
                      <p className="text-sm font-semibold">CTA Link</p>
                      <p className="text-muted-foreground text-xs truncate">{option.cta_link}</p>
                    </div>
                  )}
                </div>
                {option.tiers && Array.isArray(option.tiers) && option.tiers.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">Tiers</p>
                    <div className="flex flex-wrap gap-2">
                      {option.tiers.map((tier: any, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {tier.name} - ${tier.amount}
                        </Badge>
                      ))}
                    </div>
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
                This will permanently delete this support option. This action cannot be undone.
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
      </div>
    </AdminLayout>
  );
};

export default Support;