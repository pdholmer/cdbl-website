import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ChevronDown } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const Divisions = () => {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openInHouse, setOpenInHouse] = useState(true);
  const [openTravel, setOpenTravel] = useState(true);

  const { data: divisions, isLoading } = useQuery({
    queryKey: ['admin-divisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('divisions')
        .select('*, programs!divisions_league_program_fkey(name, type)')
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });

  const inHouseDivisions = divisions?.filter(d => d.programs?.type === 'in_house') || [];
  const travelDivisions = divisions?.filter(d => d.programs?.type === 'travel') || [];

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

      <div className="space-y-4">
        {/* In-House Program Section */}
        <Collapsible open={openInHouse} onOpenChange={setOpenInHouse}>
          <div className="rounded-md border">
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <ChevronDown className={`h-5 w-5 transition-transform ${openInHouse ? '' : '-rotate-90'}`} />
                <h3 className="text-lg font-semibold">In-House Program</h3>
                <span className="text-sm text-muted-foreground">({inHouseDivisions.length} divisions)</span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Division Name</TableHead>
                    <TableHead>Age Range</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Season Length</TableHead>
                    <TableHead className="text-center">Display Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inHouseDivisions.map((division) => (
                    <TableRow key={division.id}>
                      <TableCell className="font-medium">{division.name}</TableCell>
                      <TableCell>{division.age_range}</TableCell>
                      <TableCell>${division.cost}</TableCell>
                      <TableCell>{division.season_length || 'Not set'}</TableCell>
                      <TableCell className="text-center">{division.display_order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/admin/divisions/${division.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setDeleteId(division.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Travel Program Section */}
        <Collapsible open={openTravel} onOpenChange={setOpenTravel}>
          <div className="rounded-md border">
            <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <ChevronDown className={`h-5 w-5 transition-transform ${openTravel ? '' : '-rotate-90'}`} />
                <h3 className="text-lg font-semibold">Travel Program</h3>
                <span className="text-sm text-muted-foreground">({travelDivisions.length} divisions)</span>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Division Name</TableHead>
                    <TableHead>Age Range</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Season Length</TableHead>
                    <TableHead className="text-center">Display Order</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {travelDivisions.map((division) => (
                    <TableRow key={division.id}>
                      <TableCell className="font-medium">{division.name}</TableCell>
                      <TableCell>{division.age_range}</TableCell>
                      <TableCell>${division.cost}</TableCell>
                      <TableCell>{division.season_length || 'Not set'}</TableCell>
                      <TableCell className="text-center">{division.display_order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/admin/divisions/${division.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setDeleteId(division.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CollapsibleContent>
          </div>
        </Collapsible>
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