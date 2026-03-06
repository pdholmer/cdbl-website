import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { usePageVisibility, type PageVisibility } from "@/hooks/usePageVisibility";
import { toast } from "@/hooks/use-toast";

const SiteContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageFilter, setPageFilter] = useState<string>("all");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: content, isLoading } = useQuery({
    queryKey: ['site-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('page')
        .order('section')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: pages_visibility, isLoading: visLoading } = usePageVisibility();

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, is_visible, hidden_message }: { id: string; is_visible: boolean; hidden_message?: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const updates: Record<string, unknown> = {
        is_visible,
        hidden_by: is_visible ? null : user?.id,
        hidden_at: is_visible ? null : new Date().toISOString(),
      };
      if (hidden_message !== undefined) updates.hidden_message = hidden_message;
      const { error } = await supabase
        .from('page_visibility')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-visibility'] });
      toast({ title: "Page visibility updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMessage = useMutation({
    mutationFn: async ({ id, hidden_message }: { id: string; hidden_message: string | null }) => {
      const { error } = await supabase
        .from('page_visibility')
        .update({ hidden_message })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-visibility'] });
      toast({ title: "Message updated" });
    },
  });

  const pages = Array.from(new Set(content?.map(item => item.page) || []));

  const filteredContent = content?.filter(item => {
    const matchesSearch =
      item.content_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.page.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.section.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPage = pageFilter === "all" || item.page === pageFilter;
    return matchesSearch && matchesPage;
  });

  const getContentTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      heading: "default", text: "secondary", button: "outline",
    };
    return <Badge variant={variants[type] || "secondary"}>{type}</Badge>;
  };

  const slugToPath: Record<string, string> = {
    'registration': '/registration',
    'travel': '/travel',
    'travel-registration': '/travel/registration',
    'travel-faq': '/travel/faq',
    'in-house': '/in-house',
    'in-house-teams': '/in-house/teams',
    'in-house-schedule': '/in-house/schedule',
    'in-house-rules': '/in-house/rules',
    'schedule': '/schedule',
    'fields': '/fields',
    'shop': '/shop',
    'volunteer': '/volunteer',
    'donate': '/donate',
    'sponsors': '/sponsors',
    'contact': '/contact',
    'about': '/about',
    'board': '/board',
    'new-to-cdbl': '/new-to-cdbl',
    'rules': '/rules',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Site Content</h1>
            <p className="text-muted-foreground">Manage website text and page visibility</p>
          </div>
        </div>

        <Tabs defaultValue="visibility" className="w-full">
          <TabsList>
            <TabsTrigger value="visibility">Page Visibility</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="visibility" className="space-y-4 mt-4">
            {visLoading ? (
              <div className="text-center py-12">Loading pages...</div>
            ) : (
              <div className="grid gap-3">
                {pages_visibility?.map((page) => (
                  <Card key={page.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{page.page_label}</span>
                            <span className="text-xs text-muted-foreground">{slugToPath[page.page_slug] || `/${page.page_slug}`}</span>
                          </div>
                        </div>
                        <Badge variant={page.is_visible ? "default" : "destructive"} className="text-xs">
                          {page.is_visible ? "Visible" : "Hidden"}
                        </Badge>
                        <Switch
                          checked={page.is_visible}
                          onCheckedChange={(checked) => {
                            toggleVisibility.mutate({ id: page.id, is_visible: checked });
                            if (!checked) {
                              setExpandedCards(prev => new Set([...prev, page.id]));
                            }
                          }}
                        />
                        {!page.is_visible && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setExpandedCards(prev => {
                                const next = new Set(prev);
                                next.has(page.id) ? next.delete(page.id) : next.add(page.id);
                                return next;
                              });
                            }}
                          >
                            {expandedCards.has(page.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                      {!page.is_visible && expandedCards.has(page.id) && (
                        <div className="mt-3 space-y-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            Message shown to visitors
                          </label>
                          <Textarea
                            placeholder="e.g. Registration opens January 15"
                            defaultValue={page.hidden_message || ""}
                            onBlur={(e) => {
                              const val = e.target.value.trim() || null;
                              if (val !== page.hidden_message) {
                                updateMessage.mutate({ id: page.id, hidden_message: val });
                              }
                            }}
                            className="min-h-[60px]"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={pageFilter} onValueChange={setPageFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pages</SelectItem>
                    {pages.map(page => (
                      <SelectItem key={page} value={page}>{page}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Link to="/admin/site-content/new" className="ml-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Content
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-12">Loading content...</div>
            ) : filteredContent && filteredContent.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContent.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.page}</TableCell>
                        <TableCell>{item.section}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{item.content_key}</TableCell>
                        <TableCell className="max-w-md truncate">{item.content_value}</TableCell>
                        <TableCell>{getContentTypeBadge(item.content_type)}</TableCell>
                        <TableCell>{item.display_order}</TableCell>
                        <TableCell className="text-right">
                          <Link to={`/admin/site-content/${item.id}`}>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">No content found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SiteContent;
