import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SiteContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageFilter, setPageFilter] = useState<string>("all");

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

  // Get unique pages for filter
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
      heading: "default",
      text: "secondary",
      button: "outline",
    };
    return <Badge variant={variants[type] || "secondary"}>{type}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Site Content</h1>
            <p className="text-muted-foreground">Manage all website text content</p>
          </div>
          <Link to="/admin/site-content/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Content
            </Button>
          </Link>
        </div>

        <div className="flex gap-4">
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
            <p className="text-muted-foreground">No content found. Add your first content item to get started.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SiteContent;
