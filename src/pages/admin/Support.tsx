import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const Support = () => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading support options...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
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
                    <Button variant="outline" size="sm">
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

        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link to="/admin">← Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Support;