import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const FAQs = () => {
  const { data: faqs, isLoading } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*, programs!faqs_program_id_fkey(name)')
        .order('display_order');
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading FAQs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manage FAQs</h1>
            <p className="text-muted-foreground">Add, edit, or remove frequently asked questions</p>
          </div>
          <Button asChild>
            <Link to="/admin/faqs/new">
              <Plus className="mr-2 h-4 w-4" /> Add FAQ
            </Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {faqs?.map((faq) => (
            <Card key={faq.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    <CardDescription>
                      {faq.programs?.name || 'General'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/faqs/${faq.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link to="/admin">← Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FAQs;