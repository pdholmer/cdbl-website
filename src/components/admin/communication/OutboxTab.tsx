import { Fragment, useEffect, useState } from "react";
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
import { toast } from "sonner";
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
  created_by: string | null;
  approved_by: string | null;
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

type Profile = { id: string; display_name: string | null; email: string | null };

const STATUS_TONE: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700",
  approved: "bg-blue-100 text-blue-700",
  queued: "bg-blue-100 text-blue-700",
  sending: "bg-amber-100 text-amber-800",
  sent: "bg-emerald-100 text-emerald-700",
  delivered: "bg-emerald-100 text-emerald-700",
  opened: "bg-emerald-100 text-emerald-800",
  bounced: "bg-rose-100 text-rose-700",
  complained: "bg-rose-100 text-rose-700",
  suppressed: "bg-slate-100 text-slate-500",
  failed: "bg-rose-100 text-rose-700",
  cancelled: "bg-slate-100 text-slate-500",
};

export const OutboxTab = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<QueueRow[]>([]);
  const [expanded, setExpanded] = useState<Record<string, RecipientRow[]>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user?.id) {
      const { data: adminCheck } = await supabase.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      setIsAdmin(!!adminCheck);
    }

    const { data } = await supabase
      .from("notification_queue")
      .select(
        "id, event_key, subject, priority, status, audience_description, created_at, requires_approval, created_by, approved_by",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    const queueRows = (data ?? []) as QueueRow[];
    setRows(queueRows);

    const userIds = Array.from(
      new Set(
        queueRows.flatMap((r) => [r.created_by, r.approved_by]).filter(Boolean) as string[],
      ),
    );
    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, email")
        .in("id", userIds);
      const map: Record<string, Profile> = {};
      (profs ?? []).forEach((p: any) => (map[p.id] = p));
      setProfiles(map);
    }
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
    if (error) return toast.error(error.message);
    toast.success("Approved");
    load();
  };

  const cancel = async (id: string) => {
    setBusy(id);
    const { error } = await supabase
      .from("notification_queue")
      .update({ status: "cancelled" })
      .eq("id", id);
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Cancelled");
    load();
  };

  const nameOf = (uid: string | null) => {
    if (!uid) return "—";
    const p = profiles[uid];
    return p?.display_name || p?.email || uid.slice(0, 8);
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
            No queued messages yet. Anything saved from Compose will land here.
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Notification queue</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Approved by</TableHead>
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
                    <Fragment key={r.id}>
                      <TableRow
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
                        <TableCell className="text-xs whitespace-nowrap">
                          {formatDistanceToNow(new Date(r.created_at), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell className="max-w-[16rem] truncate">
                          {r.subject ?? "(no subject)"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {r.event_key}
                        </TableCell>
                        <TableCell className="text-sm">
                          {r.audience_description ?? "—"}
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
                        <TableCell className="text-xs">
                          {nameOf(r.created_by)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {nameOf(r.approved_by)}
                        </TableCell>
                        <TableCell
                          className="text-right whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isAdmin &&
                            r.status === "pending" &&
                            r.requires_approval && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={busy === r.id}
                                  onClick={() => approve(r.id)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={busy === r.id}
                                  onClick={() => cancel(r.id)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow>
                          <TableCell colSpan={10} className="bg-muted/30">
                            {recipients.length === 0 ? (
                              <p className="text-sm text-muted-foreground py-4 px-2">
                                No recipient rows yet. Recipients are inserted
                                when the queue is drained by the sender.
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
                                <div className="rounded-lg border bg-background overflow-x-auto">
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
                                              ? new Date(rec.delivered_at).toLocaleString()
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
                    </Fragment>
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
