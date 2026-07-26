import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type QueueRow = {
  id: string;
  event_key: string;
  subject: string | null;
  priority: string;
  status: string;
  audience_description: string | null;
  created_at: string;
  requires_approval: boolean;
};

type RecipientRow = {
  id: string;
  queue_id: string;
  address: string;
  status: string;
  sent_at: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  bounced_at: string | null;
  failure_reason: string | null;
};

const STATUS_TONE: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700",
  approved: "bg-blue-100 text-blue-700",
  sending: "bg-amber-100 text-amber-800",
  sent: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-100 text-slate-500",
};

export const OutboxTab = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [expanded, setExpanded] = useState<Record<string, RecipientRow[]>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("notification_queue")
      .select(
        "id, event_key, subject, priority, status, audience_description, created_at, requires_approval",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    setRows((data ?? []) as QueueRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (id: string) => {
    if (expanded[id]) {
      const next = { ...expanded };
      delete next[id];
      setExpanded(next);
      return;
    }
    const { data } = await supabase
      .from("notification_recipients")
      .select("*")
      .eq("queue_id", id)
      .order("created_at", { ascending: true });
    setExpanded({ ...expanded, [id]: (data ?? []) as RecipientRow[] });
  };

  const approve = async (id: string) => {
    setBusy(id);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("notification_queue")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: userData.user?.id ?? null,
      })
      .eq("id", id);
    setBusy(null);
    if (!error) load();
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-10 text-center text-muted-foreground">
            No queued or sent messages yet.
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Notification queue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const isOpen = !!expanded[r.id];
                  const recipients = expanded[r.id] ?? [];
                  const counts = recipients.reduce(
                    (acc: Record<string, number>, x) => {
                      acc[x.status] = (acc[x.status] ?? 0) + 1;
                      return acc;
                    },
                    {},
                  );
                  return (
                    <>
                      <TableRow
                        key={r.id}
                        className="cursor-pointer"
                        onClick={() => toggle(r.id)}
                      >
                        <TableCell>
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {r.subject ?? "(no subject)"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {r.event_key}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {r.audience_description ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              r.priority === "urgent" ? "destructive" : "outline"
                            }
                          >
                            {r.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              STATUS_TONE[r.status] ?? "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {r.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(r.created_at), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {r.status === "pending" && r.requires_approval && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busy === r.id}
                              onClick={() => approve(r.id)}
                            >
                              Approve
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/30">
                            {recipients.length === 0 ? (
                              <p className="text-sm text-muted-foreground py-4 px-2">
                                No recipient rows yet. Recipients are inserted when
                                the queue is drained.
                              </p>
                            ) : (
                              <div className="p-3 space-y-3">
                                <div className="flex flex-wrap gap-2 text-xs">
                                  {Object.entries(counts).map(([k, v]) => (
                                    <span
                                      key={k}
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                                        STATUS_TONE[k] ??
                                        "bg-slate-100 text-slate-700"
                                      }`}
                                    >
                                      {k}: {v}
                                    </span>
                                  ))}
                                </div>
                                <div className="rounded-lg border bg-background">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Sent</TableHead>
                                        <TableHead>Delivered</TableHead>
                                        <TableHead>Opened</TableHead>
                                        <TableHead>Failure</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {recipients.map((rec) => (
                                        <TableRow key={rec.id}>
                                          <TableCell className="text-sm">
                                            {rec.address}
                                          </TableCell>
                                          <TableCell>
                                            <span
                                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                STATUS_TONE[rec.status] ??
                                                "bg-slate-100 text-slate-700"
                                              }`}
                                            >
                                              {rec.status}
                                            </span>
                                          </TableCell>
                                          <TableCell className="text-xs text-muted-foreground">
                                            {rec.sent_at
                                              ? new Date(rec.sent_at).toLocaleString()
                                              : "—"}
                                          </TableCell>
                                          <TableCell className="text-xs text-muted-foreground">
                                            {rec.delivered_at
                                              ? new Date(
                                                  rec.delivered_at,
                                                ).toLocaleString()
                                              : "—"}
                                          </TableCell>
                                          <TableCell className="text-xs text-muted-foreground">
                                            {rec.opened_at
                                              ? new Date(rec.opened_at).toLocaleString()
                                              : "—"}
                                          </TableCell>
                                          <TableCell className="text-xs text-muted-foreground">
                                            {rec.failure_reason ?? "—"}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
