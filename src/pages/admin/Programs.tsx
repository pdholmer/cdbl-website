import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ArrowLeft, Edit } from "lucide-react";

const Programs = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: programs, isLoading } = useQuery({
    queryKey: ['admin-programs'],
    queryFn: async () => {
      const { data, error } = await supabase.from('programs').select('*').order('type');
      if (error) throw error;
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase.from('programs').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-programs'] });
      toast.success("Program updated successfully");
      setEditingId(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, programId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updates = {
      name: formData.get('name'),
      overview: formData.get('overview'),
      registration_url: formData.get('registration_url'),
      season_start: formData.get('season_start'),
      season_end: formData.get('season_end'),
      registration_open: formData.get('registration_open') === 'on',
    };
    updateMutation.mutate({ id: programId, updates });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-32 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link to="/admin" className="inline-flex items-center text-primary mb-4 hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <h1 className="text-3xl font-bold mb-8">Manage Programs</h1>

        <div className="space-y-6">
          {programs?.map((program) => (
            <Card key={program.id}>
              <CardHeader>
                <CardTitle>{program.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {editingId === program.id ? (
                  <form onSubmit={(e) => handleSubmit(e, program.id)} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Program Name</Label>
                      <Input id="name" name="name" defaultValue={program.name} required />
                    </div>
                    <div>
                      <Label htmlFor="overview">Overview</Label>
                      <Textarea id="overview" name="overview" defaultValue={program.overview || ''} rows={4} />
                    </div>
                    <div>
                      <Label htmlFor="registration_url">Registration URL</Label>
                      <Input id="registration_url" name="registration_url" defaultValue={program.registration_url || ''} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="season_start">Season Start</Label>
                        <Input id="season_start" name="season_start" type="date" defaultValue={program.season_start || ''} />
                      </div>
                      <div>
                        <Label htmlFor="season_end">Season End</Label>
                        <Input id="season_end" name="season_end" type="date" defaultValue={program.season_end || ''} />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="registration_open" name="registration_open" defaultChecked={program.registration_open} />
                      <Label htmlFor="registration_open">Registration Open</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Save Changes</Button>
                      <Button type="button" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-2">
                    <p><strong>Type:</strong> {program.type}</p>
                    <p><strong>Overview:</strong> {program.overview || 'No overview set'}</p>
                    <p><strong>Registration URL:</strong> {program.registration_url || 'Not set'}</p>
                    <p><strong>Season:</strong> {program.season_start || 'TBD'} to {program.season_end || 'TBD'}</p>
                    <p><strong>Registration:</strong> {program.registration_open ? 'Open' : 'Closed'}</p>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => setEditingId(program.id)}>Edit Inline</Button>
                      <Button variant="outline" asChild>
                        <Link to={`/admin/programs/${program.id}`}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Full
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Programs;
