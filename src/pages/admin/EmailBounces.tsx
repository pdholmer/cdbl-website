import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface Bounce {
  id: string;
  email: string;
  reason: string | null;
  bounce_type: string;
  source: string | null;
  bounced_at: string;
  resolved: boolean;
  resolved_at: string | null;
  notes: string | null;
}

const EmailBounces = () => {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Bounce | null>(null);
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["email-bounces"],
    queryFn: async (): Promise<Bounce[]> => {
      const { data, error } = await supabase
        .from("email_bounces")
        .select("*")
        .order("bounced_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Bounce[];
    },
  });

  const resolve = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("email_bounces")
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: user.user?.id,
          notes,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Marked as resolved");
      qc.invalidateQueries({ queryKey: ["email-bounces"] });
      setSelected(null);
      setNotes("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const unresolved = (data ?? []).filter((b) => !b.resolved);

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Email Bounces</h1>
          <p className="text-muted-foreground">
            Hard bounces — addresses that couldn't receive email. Contact the family through
            another channel and mark as resolved once fixed.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <CardTitle>Unresolved ({unresolved.length})</CardTitle>
                <CardDescription>Addresses that are silently failing right now</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : (data ?? []).length === 0 ? (
              <p className="text-muted-foreground text-sm">No bounces recorded.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data ?? []).map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-sm">{b.email}</TableCell>
                      <TableCell>
                        <Badge variant={b.bounce_type === "hard" ? "destructive" : "secondary"}>
                          {b.bounce_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {b.reason ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(b.bounced_at), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      <TableCell>
                        {b.resolved ? (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Resolved
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Open</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!b.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelected(b);
                              setNotes(b.notes ?? "");
                            }}
                          >
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve bounce for {selected?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Add a note about what you did (called the family, they updated their address, etc.).
            </p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Called family, they'll use new@example.com going forward."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => selected && resolve.mutate({ id: selected.id, notes })}
              disabled={resolve.isPending}
            >
              Mark resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default EmailBounces;
