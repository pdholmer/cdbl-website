import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, CheckCheck, Inbox } from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

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

type AdminUser = {
  id: string;
  display_name: string | null;
  email: string | null;
};

type Filter = "all" | "unread" | "mine";

export const InboxTab = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ContactMessage[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("unread");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    setMe(userData.user?.id ?? null);

    const [{ data: msgs, error }, { data: roleRows }] = await Promise.all([
      supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("user_roles")
        .select("user_id")
        .in("role", ["admin", "board_member"]),
    ]);

    if (error) toast.error(error.message);
    setRows((msgs ?? []) as ContactMessage[]);

    const adminIds = Array.from(
      new Set((roleRows ?? []).map((r: any) => r.user_id)),
    );
    if (adminIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name, email")
        .in("id", adminIds);
      setAdmins((profs ?? []) as AdminUser[]);
    } else {
      setAdmins([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const isUnread = (m: ContactMessage) => !m.read_at && m.status !== "read";

  const visible = useMemo(() => {
    switch (filter) {
      case "unread":
        return rows.filter(isUnread);
      case "mine":
        return rows.filter((m) => m.assigned_to && m.assigned_to === me);
      default:
        return rows;
    }
  }, [rows, filter, me]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;

  const openRow = async (row: ContactMessage) => {
    setSelectedId(row.id);
    if (isUnread(row)) {
      await markRead(row.id, { silent: true });
    }
  };

  const markRead = async (id: string, opts?: { silent?: boolean }) => {
    setBusy(true);
    const { error } = await supabase
      .from("contact_messages")
      .update({ status: "read", read_at: new Date().toISOString() })
      .eq("id", id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!opts?.silent) toast.success("Marked as read");
    load();
  };

  const assign = async (id: string, userId: string | null) => {
    setBusy(true);
    const { error } = await supabase
      .from("contact_messages")
      .update({ assigned_to: userId })
      .eq("id", id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(userId ? "Assigned" : "Unassigned");
    load();
  };

  const unreadCount = rows.filter(isUnread).length;
  const mineCount = rows.filter((m) => m.assigned_to === me).length;

  const displayName = (uid: string | null) => {
    if (!uid) return null;
    const a = admins.find((x) => x.id === uid);
    return a?.display_name || a?.email || "Unknown";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Inbox className="h-4 w-4" />
          <span>
            <span className="font-medium text-foreground">{rows.length}</span>{" "}
            total · <span className="font-medium text-foreground">{unreadCount}</span>{" "}
            unread
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({rows.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === "mine" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("mine")}
          >
            Assigned to me ({mineCount})
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-10 text-center text-muted-foreground">
            <CheckCheck className="mx-auto h-8 w-8 mb-2" />
            {filter === "unread"
              ? "No unread messages."
              : filter === "mine"
              ? "Nothing assigned to you."
              : "No contact messages yet."}
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((m) => {
                const unread = isUnread(m);
                return (
                  <TableRow
                    key={m.id}
                    onClick={() => openRow(m)}
                    className={`cursor-pointer ${
                      unread ? "bg-primary/5 font-medium" : ""
                    }`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {unread && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                        {m.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {m.email}
                    </TableCell>
                    <TableCell className="max-w-[24rem] truncate">
                      {m.subject}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(m.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      {unread ? (
                        <Badge variant="destructive">Unread</Badge>
                      ) : (
                        <Badge variant="outline">Read</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {displayName(m.assigned_to) ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Sheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelectedId(null)}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="pr-6">{selected.subject}</SheetTitle>
                <SheetDescription>
                  From <span className="font-medium">{selected.name}</span> ·{" "}
                  {selected.email}
                  {selected.phone ? ` · ${selected.phone}` : ""}
                  <br />
                  <span className="text-xs">
                    Received{" "}
                    {format(new Date(selected.created_at), "PPpp")}
                  </span>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="rounded-xl bg-muted/50 p-4 text-sm whitespace-pre-wrap">
                  {selected.message}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium uppercase text-muted-foreground">
                      Assign to
                    </label>
                    <Select
                      value={selected.assigned_to ?? "unassigned"}
                      onValueChange={(v) =>
                        assign(selected.id, v === "unassigned" ? null : v)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {admins.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.display_name || a.email || "Admin"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      onClick={() =>
                        (window.location.href = `mailto:${selected.email}?subject=${encodeURIComponent(
                          "Re: " + selected.subject,
                        )}`)
                      }
                    >
                      <Mail className="h-4 w-4 mr-1" /> Reply via email
                    </Button>
                    {isUnread(selected) && (
                      <Button
                        variant="secondary"
                        disabled={busy}
                        onClick={() => markRead(selected.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                    {me && selected.assigned_to !== me && (
                      <Button
                        variant="outline"
                        disabled={busy}
                        onClick={() => assign(selected.id, me)}
                      >
                        Assign to me
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground pt-4">
                    Sending email from the app is not wired yet. Reply opens
                    your mail client.
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
