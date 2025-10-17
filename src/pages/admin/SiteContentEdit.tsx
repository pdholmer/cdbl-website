import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowLeft, Trash2 } from "lucide-react";

interface SiteContentForm {
  page: string;
  section: string;
  content_key: string;
  content_value: string;
  content_type: string;
  display_order: number;
  notes?: string;
}

const SiteContentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === "new";

  const { register, handleSubmit, reset, setValue } = useForm<SiteContentForm>({
    defaultValues: {
      display_order: 0,
      content_type: "text",
    },
  });

  const { data: content } = useQuery({
    queryKey: ['site-content', id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  useEffect(() => {
    if (content) {
      reset(content);
    }
  }, [content, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: SiteContentForm) => {
      if (isNew) {
        const { error } = await supabase
          .from('site_content')
          .insert([data]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_content')
          .update(data)
          .eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
      toast.success(isNew ? "Content created successfully" : "Content updated successfully");
      navigate('/admin/site-content');
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('site_content')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content'] });
      toast.success("Content deleted successfully");
      navigate('/admin/site-content');
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const onSubmit = (data: SiteContentForm) => {
    saveMutation.mutate(data);
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/site-content')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isNew ? "Add Content" : "Edit Content"}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? "Create a new content item" : "Update content details"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page">Page</Label>
              <Input
                id="page"
                {...register("page", { required: true })}
                placeholder="e.g., home, about, registration"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                {...register("section", { required: true })}
                placeholder="e.g., hero, intro, programs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content_key">Content Key</Label>
            <Input
              id="content_key"
              {...register("content_key", { required: true })}
              placeholder="e.g., home_hero_title"
            />
            <p className="text-sm text-muted-foreground">
              Unique identifier for this content (use snake_case)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content_value">Content Value</Label>
            <Textarea
              id="content_value"
              {...register("content_value", { required: true })}
              placeholder="The actual text content..."
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="content_type">Content Type</Label>
              <Select
                onValueChange={(value) => setValue("content_type", value)}
                defaultValue={content?.content_type || "text"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heading">Heading</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="button">Button</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="label">Label</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                {...register("display_order", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Internal notes about this content..."
              rows={3}
            />
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {!isNew && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" type="button">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Content</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this content? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/site-content')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default SiteContentEdit;
