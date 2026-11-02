import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";

/** First-time family setup. Writes only through the create_my_household function. */
const HouseholdNew = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [f, setF] = useState({
    first: "", last: "", phone: "", relationship: "",
    a1: "", a2: "", city: "", state: "IL", zip: "", d301: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
  }, []);

  if (authed === false) return <Navigate to="/login?next=/household/new" replace />;

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    const { error } = await supabase.rpc("create_my_household", {
      _first_name: f.first, _last_name: f.last, _phone: f.phone, _relationship: f.relationship,
      _address_line1: f.a1, _address_line2: f.a2, _city: f.city, _state: f.state, _zip_code: f.zip,
      _d301_attestation: f.d301,
    });
    setSaving(false);
    if (error) {
      if (error.message.includes("already have a household")) {
        navigate("/household", { replace: true });
        return;
      }
      setErr(error.message);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["household-overview"] });
    navigate("/household", { replace: true });
  };

  const field = (id: keyof typeof f, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={f[id]} onChange={set(id)} className="h-11" {...props} />
    </div>
  );

  return (
    <AppShell area="family" label="2027 season, In-House" title="Set up your household">
      <div className="mx-auto w-full max-w-xl px-4 py-8 sm:px-6">
        <form onSubmit={submit} className="tex-mesh space-y-6 rounded-xl border border-border bg-card p-5">
          <p className="text-[15px] text-muted-foreground">
            Tell us who you are and where you live. You can add your players next.
          </p>
          <fieldset className="space-y-4">
            <legend className="mb-2 font-label text-[17px] font-semibold">You</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("first", "First name", { required: true, autoComplete: "given-name" })}
              {field("last", "Last name", { required: true, autoComplete: "family-name" })}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("phone", "Mobile phone", { type: "tel", autoComplete: "tel", inputMode: "tel" })}
              {field("relationship", "Relationship to players", { placeholder: "Parent" })}
            </div>
          </fieldset>
          <fieldset className="space-y-4">
            <legend className="mb-2 font-label text-[17px] font-semibold">Home address</legend>
            {field("a1", "Street address", { required: true, autoComplete: "address-line1" })}
            {field("a2", "Apartment or unit (optional)", { autoComplete: "address-line2" })}
            <div className="grid grid-cols-[1fr_72px_110px] gap-3">
              {field("city", "City", { required: true, autoComplete: "address-level2" })}
              {field("state", "State", { required: true, maxLength: 2, autoComplete: "address-level1" })}
              {field("zip", "ZIP", { required: true, inputMode: "numeric", autoComplete: "postal-code" })}
            </div>
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="mb-2 font-label text-[17px] font-semibold">Residency</legend>
            <p className="text-sm text-muted-foreground">
              CDBL is for families who live in Community Unit School District 301. Type D301 to confirm that you do.
            </p>
            {field("d301", "Type D301", { required: true, autoCapitalize: "characters", autoComplete: "off" })}
          </fieldset>
          {err && <p role="alert" className="text-sm font-semibold text-destructive">{err}</p>}
          <Button type="submit" disabled={saving} className="h-12 w-full rounded-full text-base">
            {saving ? "Saving" : "Save household"}
          </Button>
        </form>
      </div>
    </AppShell>
  );
};

export default HouseholdNew;
