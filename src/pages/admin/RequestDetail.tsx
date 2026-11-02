import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { KIND_LABEL, STATUS_LABEL } from "./Requests";

const RequestDetail = () => {
  const { id } = useParams();
  const qc = useQueryClient();
  const [status, setStatus] = useState("new");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const req = useQuery({
    queryKey: ["assistant-request", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("assistant_requests").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const convoId = req.data?.conversation_id;
  const msgs = useQuery({
    queryKey: ["assistant-messages", convoId],
    enabled: !!convoId,
    queryFn: async () => {
      const { data, error } = await supabase.from("assistant_messages")
        .select("id, role, content, created_at, page_path").eq("conversation_id", convoId!).order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (req.data) { setStatus(req.data.status); setNotes(req.data.admin_notes ?? ""); }
  }, [req.data]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("assistant_requests").update({ status, admin_notes: notes || null }).eq("id", id!);
    setSaving(false);
    if (error) { toast.error("Couldn't save. Try again."); return; }
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["assistant-requests"] });
    req.refetch();
  };

  const r = req.data;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <Link to="/admin/requests" className="inline-flex items-center gap-2 text-sm text-muted-foreground min-h-11">
          <ArrowLeft className="h-4 w-4" /> All requests
        </Link>

        {req.isLoading ? <p className="text-muted-foreground">Loading...</p>
        : req.error ? (
          <Card><CardContent className="p-6 space-y-3"><p>This request couldn't be loaded.</p>
            <Button variant="outline" onClick={() => req.refetch()}>Try again</Button></CardContent></Card>
        ) : !r ? <p className="text-muted-foreground">Request not found.</p> : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <p className="text-sm text-muted-foreground">{KIND_LABEL[r.kind]} sent {format(new Date(r.created_at), "MMM d, yyyy h:mm a")}</p>
                <CardTitle className="text-xl">{r.summary}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="space-y-2 text-sm">
                  <div><dt className="font-medium inline">From: </dt><dd className="inline">{r.requester_name} (<a className="underline" href={`mailto:${r.requester_email}`}>{r.requester_email}</a>)</dd></div>
                  {r.page_path && <div><dt className="font-medium inline">Page: </dt><dd className="inline">{r.page_path}</dd></div>}
                  {r.details && <div><dt className="font-medium">Details</dt><dd className="whitespace-pre-wrap">{r.details}</dd></div>}
                  <div><dt className="font-medium inline">Owner alert: </dt><dd className="inline">{r.owner_emailed_at ? `emailed ${format(new Date(r.owner_emailed_at), "MMM d, h:mm a")}` : "not sent"}</dd></div>
                </dl>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="status">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status" className="min-h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(STATUS_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="notes">Notes</label>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
                </div>
                <Button className="min-h-11 w-full sm:w-auto" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Conversation</CardTitle></CardHeader>
              <CardContent>
                {!convoId ? <p className="text-sm text-muted-foreground">No conversation is linked to this request.</p>
                : msgs.isLoading ? <p className="text-sm text-muted-foreground">Loading...</p>
                : msgs.error ? <Button variant="outline" onClick={() => msgs.refetch()}>Try again</Button>
                : (
                  <ol className="space-y-3">
                    {(msgs.data ?? []).map((m) => (
                      <li key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <p className="whitespace-pre-wrap">{m.content}</p>
                          <p className="mt-1 text-[11px] opacity-70">{format(new Date(m.created_at), "h:mm a")}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default RequestDetail;
