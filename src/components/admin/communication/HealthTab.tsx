import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Suppression = {
  id: string;
  email: string;
  reason: string;
  detail: string | null;
  source: string | null;
  created_at: string;
  released_at: string | null;
};

type League = {
  sending_domain: string | null;
  sending_from_address: string | null;
  reply_to_address: string | null;
};

export const HealthTab = () => {
  const [loading, setLoading] = useState(true);
  const [suppressions, setSuppressions] = useState<Suppression[]>([]);
  const [league, setLeague] = useState<League | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: sup }, { data: lg }] = await Promise.all([
      supabase
        .from("email_suppressions")
        .select("*")
        .is("released_at", null)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("leagues")
        .select("sending_domain, sending_from_address, reply_to_address")
        .eq("slug", "cdbl")
        .maybeSingle(),
    ]);
    setSuppressions((sup ?? []) as Suppression[]);
    setLeague((lg as League) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const release = async (row: Suppression) => {
    setBusy(row.id);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("email_suppressions")
      .update({
        released_at: new Date().toISOString(),
        released_by: userData.user?.id ?? null,
      })
      .eq("id", row.id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success(`Released ${row.email}`);
    load();
  };

  const domainConfigured =
    !!league?.sending_domain && !!league?.sending_from_address;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {domainConfigured ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              )}
              Sending domain
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {domainConfigured ? (
              <>
                <p>
                  <span className="text-muted-foreground">From:</span>{" "}
                  <span className="font-medium">
                    {league?.sending_from_address}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Reply-to:</span>{" "}
                  {league?.reply_to_address ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground pt-2">
                  Domain verification is confirmed in Resend, not here. If sends
                  fail, check the domain in the Resend dashboard.
                </p>
              </>
            ) : (
              <p className="text-amber-700">
                No sending domain configured on the league row. No email will
                send until this is set.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              Custom SMTP
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p className="text-muted-foreground">
              Not configured. Outbound email routes through Resend using{" "}
              <code>RESEND_API_KEY</code>. Add a custom SMTP integration later if
              you need to route through your own MTA.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-base">
            Suppression list ({suppressions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : suppressions.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              No active suppressions. Bounces and complaints will appear here.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppressions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{s.reason}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.source ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(s.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy === s.id}
                        onClick={() => release(s)}
                      >
                        Release
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
