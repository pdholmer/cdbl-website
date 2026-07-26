import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
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

type Counters = {
  queued: number;
  sent30d: number;
  bounceRate: number | null;
  complaintRate: number | null;
  totalAttempted30d: number;
};

export const HealthTab = () => {
  const [loading, setLoading] = useState(true);
  const [suppressions, setSuppressions] = useState<Suppression[]>([]);
  const [league, setLeague] = useState<League | null>(null);
  const [counters, setCounters] = useState<Counters | null>(null);
  const [anySendSucceeded, setAnySendSucceeded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { data: sup },
      { data: lg },
      { count: queued },
      { count: sent30 },
      { count: bounced30 },
      { count: complained30 },
      { count: successAny },
      { count: attempted30 },
    ] = await Promise.all([
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
      supabase
        .from("notification_queue")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "approved", "queued", "sending"]),
      supabase
        .from("notification_recipients")
        .select("id", { count: "exact", head: true })
        .in("status", ["sent", "delivered", "opened"])
        .gte("created_at", since),
      supabase
        .from("notification_recipients")
        .select("id", { count: "exact", head: true })
        .eq("status", "bounced")
        .gte("created_at", since),
      supabase
        .from("notification_recipients")
        .select("id", { count: "exact", head: true })
        .eq("status", "complained")
        .gte("created_at", since),
      supabase
        .from("notification_recipients")
        .select("id", { count: "exact", head: true })
        .in("status", ["sent", "delivered", "opened"])
        .limit(1),
      supabase
        .from("notification_recipients")
        .select("id", { count: "exact", head: true })
        .in("status", [
          "sent",
          "delivered",
          "opened",
          "bounced",
          "complained",
          "failed",
        ])
        .gte("created_at", since),
    ]);

    setSuppressions((sup ?? []) as Suppression[]);
    setLeague((lg as League) ?? null);
    setAnySendSucceeded((successAny ?? 0) > 0);

    const total = attempted30 ?? 0;
    setCounters({
      queued: queued ?? 0,
      sent30d: sent30 ?? 0,
      totalAttempted30d: total,
      bounceRate: total > 0 ? (bounced30 ?? 0) / total : null,
      complaintRate: total > 0 ? (complained30 ?? 0) / total : null,
    });
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

  const configured = !!league?.sending_domain && anySendSucceeded;

  const fmtPct = (v: number | null) =>
    v === null ? "—" : `${(v * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {configured ? (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          <AlertTitle>Email sending is live</AlertTitle>
          <AlertDescription>
            Sending from <code>{league?.sending_from_address}</code> on{" "}
            <code>{league?.sending_domain}</code>. At least one send has
            succeeded.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertTriangle className="h-4 w-4 text-amber-700" />
          <AlertTitle>Email sending is not configured</AlertTitle>
          <AlertDescription>
            No message can currently be delivered. The Compose tab writes to the
            queue, but nothing is drained until a sending domain is set on the
            league row and at least one send has succeeded.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard
          label="Currently queued"
          value={loading ? "…" : counters?.queued.toLocaleString() ?? "0"}
        />
        <MetricCard
          label="Sent (last 30d)"
          value={loading ? "…" : counters?.sent30d.toLocaleString() ?? "0"}
        />
        <MetricCard
          label="Bounce rate (30d)"
          value={loading ? "…" : fmtPct(counters?.bounceRate ?? null)}
          hint={
            counters && (counters.bounceRate ?? 0) > 0.05
              ? "Above 5% — investigate"
              : undefined
          }
          hintTone={
            counters && (counters.bounceRate ?? 0) > 0.05 ? "warn" : undefined
          }
        />
        <MetricCard
          label="Complaint rate (30d)"
          value={loading ? "…" : fmtPct(counters?.complaintRate ?? null)}
          hint={
            counters && (counters.complaintRate ?? 0) > 0.001
              ? "Above 0.1% — investigate"
              : undefined
          }
          hintTone={
            counters && (counters.complaintRate ?? 0) > 0.001
              ? "warn"
              : undefined
          }
        />
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

function MetricCard({
  label,
  value,
  hint,
  hintTone,
}: {
  label: string;
  value: string;
  hint?: string;
  hintTone?: "warn";
}) {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase text-muted-foreground tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-heading mt-1">{value}</p>
        {hint && (
          <p
            className={`text-xs mt-1 ${
              hintTone === "warn" ? "text-amber-700" : "text-muted-foreground"
            }`}
          >
            {hint}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
