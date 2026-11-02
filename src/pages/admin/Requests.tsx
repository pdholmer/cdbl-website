import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const STATUS_LABEL: Record<string, string> = { new: "New", in_progress: "In progress", done: "Done" };
export const KIND_LABEL: Record<string, string> = { help: "Help", problem: "Problem", feedback: "Feedback" };

const Requests = () => {
  const [status, setStatus] = useState("all");
  const [kind, setKind] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["assistant-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assistant_requests")
        .select("id, kind, status, requester_name, requester_email, summary, page_path, created_at, conversation_id")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = useMemo(() => (data ?? []).filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    if (kind !== "all" && r.kind !== kind) return false;
    if (from && r.created_at < from) return false;
    if (to && r.created_at.slice(0, 10) > to) return false;
    return true;
  }), [data, status, kind, from, to]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Requests</h1>
          <p className="text-muted-foreground">Help requests, problem reports and feedback sent through the site assistant.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="min-h-11" aria-label="Status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(STATUS_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger className="min-h-11" aria-label="Type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {Object.entries(KIND_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" className="min-h-11" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
          <Input type="date" className="min-h-11" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading requests...</p>
        ) : error ? (
          <Card><CardContent className="p-6 space-y-3">
            <p>Requests couldn't be loaded.</p>
            <Button variant="outline" onClick={() => refetch()}>Try again</Button>
          </CardContent></Card>
        ) : rows.length === 0 ? (
          <Card><CardContent className="p-6 text-muted-foreground">
            {data?.length ? "No requests match these filters." : "No requests yet. They'll appear here when someone sends one from the site assistant."}
          </CardContent></Card>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {rows.map((r) => (
              <li key={r.id}>
                <Link to={`/admin/requests/${r.id}`} className="block rounded-2xl border bg-card p-4 shadow-sm hover:bg-muted/50 min-h-11">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={r.status === "new" ? "default" : "secondary"}>{STATUS_LABEL[r.status]}</Badge>
                    <Badge variant="outline">{KIND_LABEL[r.kind]}</Badge>
                    <span className="ml-auto text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM d, h:mm a")}</span>
                  </div>
                  <p className="font-medium">{r.summary}</p>
                  <p className="text-sm text-muted-foreground mt-1">{r.requester_name} ({r.requester_email}){r.page_path ? `, on ${r.page_path}` : ""}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
};

export default Requests;
