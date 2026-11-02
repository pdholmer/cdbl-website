import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusChip } from "@/components/family/StatusChip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ATTEST = "I am this child's parent or legal guardian";

type Doc = { id: string; form_key: string; version: number; title: string; body: string; kind: string; required: boolean; is_placeholder: boolean; display_order: number; requires_resign: boolean };
type Sig = { id: string; form_key: string; form_version: number; guardian_id: string; typed_name: string | null; photo_release_consent: boolean | null; signed_at: string; attested: boolean };

/** Form rows for one registration. Signing goes only through sign_registration_form. */
export type NextForm = { title: string; open: () => void } | null;

export const RegistrationForms = ({ registrationId, childName, onNext }: {
  registrationId: string; childName: string;
  /** Reports the next required form (or null when every required form is signed) for the action bar. */
  onNext?: (next: NextForm, ready: boolean) => void;
}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["registration-forms", registrationId],
    queryFn: async () => {
      const { data: docs, error: de } = await supabase.from("form_documents").select("*").order("version", { ascending: false });
      if (de) throw de;
      const { data: sigs, error: se } = await supabase.from("registration_forms")
        .select("id, form_key, form_version, guardian_id, typed_name, photo_release_consent, signed_at, attested")
        .eq("registration_id", registrationId).order("signed_at", { ascending: false });
      if (se) throw se;
      const gids = [...new Set((sigs ?? []).map((s) => s.guardian_id))];
      const { data: gs } = gids.length
        ? await supabase.from("guardians").select("id, first_name, last_name").in("id", gids)
        : { data: [] as { id: string; first_name: string | null; last_name: string | null }[] };
      const latest = new Map<string, Doc>();
      const minValid = new Map<string, number>();
      for (const d of (docs ?? []) as Doc[]) {
        if (!latest.has(d.form_key)) latest.set(d.form_key, d);
        if (d.requires_resign) minValid.set(d.form_key, Math.max(minValid.get(d.form_key) ?? 1, d.version));
      }
      return {
        docs: [...latest.values()].sort((a, b) => a.display_order - b.display_order),
        sigs: (sigs ?? []) as Sig[],
        minValid,
        guardians: gs ?? [],
      };
    },
  });

  const [open, setOpen] = useState<Doc | null>(null);
  const [name, setName] = useState("");
  const [attested, setAttested] = useState(false);
  const [photo, setPhoto] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!onNext) return;
    if (!data) { onNext(null, false); return; }
    const nd = data.docs.find((d) => d.required && !data.sigs.find((s) => s.form_key === d.form_key && s.form_version >= (data.minValid.get(d.form_key) ?? 1)));
    onNext(nd ? { title: nd.title, open: () => { setOpen(nd); setName(""); setAttested(false); setPhoto(null); setErr(null); } } : null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (isLoading) return <p className="text-[15px] text-muted-foreground">Loading forms</p>;
  if (error || !data) return <p className="text-[15px]">We couldn't load the forms. <button className="min-h-[44px] underline" onClick={() => refetch()}>Try again</button></p>;

  const current = (d: Doc) => data.sigs.find((s) => s.form_key === d.form_key && s.form_version >= (data.minValid.get(d.form_key) ?? 1));
  const nextKey = data.docs.find((d) => d.required && !current(d))?.form_key;
  const signer = (s: Sig) => {
    const g = data.guardians.find((x) => x.id === s.guardian_id);
    return g ? `${g.first_name ?? ""} ${g.last_name ?? ""}`.trim() : s.typed_name ?? "a guardian";
  };
  const when = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const begin = (d: Doc) => { setOpen(d); setName(""); setAttested(false); setPhoto(current(d)?.photo_release_consent ?? null); setErr(null); };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!open) return;
    setSaving(true); setErr(null);
    const { error: se } = await supabase.rpc("sign_registration_form", {
      _registration_id: registrationId, _form_document_id: open.id, _typed_name: name, _attested: open.kind === "signature" ? attested : true,
      _photo_release_consent: open.kind === "choice" ? photo : undefined, _locale: navigator.language, _user_agent: navigator.userAgent,
    } as never);
    setSaving(false);
    if (se) { setErr(se.message); return; }
    toast.success(open.kind === "choice" ? "Choice saved" : "Signed");
    setOpen(null);
    refetch();
  };

  return (
    <section aria-label="Forms" className="space-y-3">
      <p className="font-label text-[17px] font-semibold">Forms for {childName}</p>
      <ul className="space-y-3">
        {data.docs.map((d) => {
          const s = current(d);
          const flood = d.form_key === nextKey;
          return (
            <li key={d.id} className={cn("rounded-xl border p-4", flood ? "card-flood" : "tex-mesh border-border bg-card")}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  {flood && <p className="font-label text-xs font-semibold tracking-[0.12em]">NEXT TO SIGN</p>}
                  <p className="font-label text-[17px] font-semibold">{d.title}</p>
                  <p className={cn("mt-0.5 text-sm", flood ? "text-white/90" : "text-muted-foreground")}>
                    {s
                      ? d.kind === "choice"
                        ? `${s.photo_release_consent ? "Photos allowed" : "No photos"}, chosen by ${signer(s)} on ${when(s.signed_at)}`
                        : `Signed by ${signer(s)} on ${when(s.signed_at)}`
                      : d.required ? "Needs a parent or guardian signature" : "Optional choice, photos are allowed unless you opt out"}
                  </p>
                </div>
                {!flood && <StatusChip tone={s ? "success" : d.required ? "warning" : "neutral"}>{s ? (d.kind === "choice" ? "Chosen" : "Signed") : d.required ? "Due" : "Optional"}</StatusChip>}
              </div>
              {(!s || d.kind === "choice") && (
                <button type="button" onClick={() => begin(d)}
                  className={cn("mt-3 inline-flex h-11 items-center rounded-full px-5 font-label text-[15px] font-semibold",
                    flood ? "bg-white text-[#003DA5]" : "bg-primary text-primary-foreground")}>
                  {d.kind === "choice" ? (s ? "Change choice" : "Choose") : "Sign"}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto sm:mx-auto sm:max-w-xl sm:rounded-t-2xl">
          {open && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="font-display text-2xl">{open.title}</SheetTitle>
                <SheetDescription>Version {open.version}</SheetDescription>
              </SheetHeader>
              <form onSubmit={submit} className="mt-4 space-y-5 pb-4">
                <div className="whitespace-pre-wrap rounded-lg border border-border p-4 text-[15px]">{open.body}</div>
                {open.kind === "choice" ? (
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Photo release">
                    {[{ v: true, t: "Yes, photos are fine" }, { v: false, t: "No photos of my player" }].map((o) => (
                      <button key={String(o.v)} type="button" role="radio" aria-checked={photo === o.v} onClick={() => setPhoto(o.v)}
                        className={cn("min-h-[44px] rounded-full border px-5 font-label text-[15px] font-semibold",
                          photo === o.v ? "is-selected border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>
                        {o.t}
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <label className="flex min-h-[44px] items-center gap-3 text-[15px]">
                      <input type="checkbox" className="h-5 w-5" checked={attested} onChange={(e) => setAttested(e.target.checked)} />
                      {ATTEST}
                    </label>
                    <div className="space-y-1.5">
                      <Label htmlFor="sig-name">Type your full name to sign</Label>
                      <Input id="sig-name" className="h-11" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
                    </div>
                  </>
                )}
                {err && <p role="alert" className="text-sm font-semibold text-destructive">{err}</p>}
                <button type="submit" disabled={saving}
                  className="h-12 w-full rounded-full bg-primary font-label text-base font-semibold text-primary-foreground disabled:opacity-50">
                  {saving ? "Saving" : open.kind === "choice" ? "Save choice" : "Sign this form"}
                </button>
              </form>
            </>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default RegistrationForms;
