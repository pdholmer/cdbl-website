import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox, Mail, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  read_at: string | null;
  assigned_to: string | null;
  responded_at: string | null;
};

export const InboxTab = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState<"unread" | "all">("unread");
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    const q = supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    setRows((data ?? []) as ContactMessage[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(
    () =>
      filter === "unread"
        ? rows.filter((r) => !r.read_at && r.status !== "read")
        : rows,
    [rows, filter],
  );

  const markBusy = (id: string, on: boolean) =>
    setBusyIds((prev) => {
      const next = new Set(prev);
      on ? next.add(id) : next.delete(id);
      return next;
    });

  const markRead = async (id: string) => {
    markBusy(id, true);
    const { error } = await supabase
      .from("contact_messages")
      .update({ status: "read", read_at: new Date().toISOString() })
      .eq("id", id);
    markBusy(id, false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Marked as read");
    load();
  };

  const assignToMe = async (id: string) => {
    markBusy(id, true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      toast.error("Not signed in");
      markBusy(id, false);
      return;
    }
    const { error } = await supabase
      .from("contact_messages")
      .update({ assigned_to: uid })
      .eq("id", id);
    markBusy(id, false);
    if (error) return toast.error(error.message);
    toast.success("Assigned to you");
    load();
  };

  const unreadCount = rows.filter((r) => !r.read_at && r.status !== "read").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Inbox className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {unreadCount} unread
          </span>
          <span className="text-muted-foreground">of {rows.length}</span>
        </div>
        <div className="flex-1" />
        <div className="flex gap-2">
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-10 text-center text-muted-foreground">
            <CheckCheck className="mx-auto h-8 w-8 mb-2" />
            {filter === "unread"
              ? "No unread messages."
              : "No contact messages yet."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((m) => {
            const isRead = !!m.read_at || m.status === "read";
            const busy = busyIds.has(m.id);
            return (
              <Card
                key={m.id}
                className={`rounded-2xl shadow-md transition ${
                  isRead ? "opacity-70" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{m.subject}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {m.name} · {m.email}
                        {m.phone ? ` · ${m.phone}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isRead && <Badge variant="destructive">New</Badge>}
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(m.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        (window.location.href = `mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`)
                      }
                    >
                      <Mail className="h-4 w-4 mr-1" /> Reply
                    </Button>
                    {!isRead && (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={busy}
                        onClick={() => markRead(m.id)}
                      >
                        Mark read
                      </Button>
                    )}
                    {!m.assigned_to && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => assignToMe(m.id)}
                      >
                        Assign to me
                      </Button>
                    )}
                    {m.assigned_to && (
                      <Badge variant="outline">Assigned</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
