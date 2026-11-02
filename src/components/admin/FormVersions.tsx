import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { StatusChip } from "@/components/family/StatusChip";
import { toast } from "sonner";

/** Registration form wording. New versions only go through publish_form_version (admin). */
export const FormVersions = ({ isAdmin }: { isAdmin: boolean }) => {
  const { data, refetch } = useQuery({
    queryKey: ["admin-form-documents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("form_documents").select("*").order("version", { ascending: false });
      if (error) throw error;
      const latest = new Map<string, (typeof data)[number]>();
      for (const d of data ?? []) if (!latest.has(d.form_key)) latest.set(d.form_key, d);
      return [...latest.values()].sort((a, b) => a.display_order - b.display_order);
    },
  });
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [resign, setResign] = useState(false);

  const publish = async (key: string) => {
    const { error } = await supabase.rpc("publish_form_version", { _form_key: key, _title: title, _body: body, _require_resign: resign });
    if (error) return toast.error(error.message);
    toast.success(resign ? "New version published. Families must sign it again." : "New version published");
    setEditing(null); refetch();
  };

  return (
    <section className="space-y-3" aria-label="Registration forms">
      <p className="font-label text-[17px] font-semibold">Registration forms</p>
      <ul className="space-y-3">
        {(data ?? []).map((d) => (
          <li key={d.id} className="tex-mesh rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-label text-[17px] font-semibold">{d.title}</p>
                <p className="text-sm text-muted-foreground">Version {d.version}{d.kind === "choice" ? ", yes or no choice" : d.required ? ", required" : ""}</p>
              </div>
              {d.is_placeholder ? <StatusChip tone="warning">Placeholder wording</StatusChip> : <StatusChip tone="success">Final wording</StatusChip>}
            </div>
            {isAdmin && editing !== d.form_key && (
              <Button variant="outline" className="mt-3 h-11 rounded-full"
                onClick={() => { setEditing(d.form_key); setTitle(d.title); setBody(d.body); setResign(false); }}>
                Write a new version
              </Button>
            )}
            {editing === d.form_key && (
              <div className="mt-4 space-y-3">
                <div className="space-y-1.5"><Label htmlFor={`t-${d.id}`}>Title</Label><Input id={`t-${d.id}`} className="h-11" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                <div className="space-y-1.5"><Label htmlFor={`b-${d.id}`}>Wording</Label><Textarea id={`b-${d.id}`} rows={8} value={body} onChange={(e) => setBody(e.target.value)} /></div>
                <label className="flex min-h-[44px] items-center gap-3 text-[15px]">
                  <Switch checked={resign} onCheckedChange={setResign} />
                  Require re-sign: families who signed an older version must sign this one
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button className="h-11 rounded-full" onClick={() => publish(d.form_key)}>Publish version {d.version + 1}</Button>
                  <Button variant="outline" className="h-11 rounded-full" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FormVersions;
