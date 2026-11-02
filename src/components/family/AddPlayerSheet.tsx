import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";

interface AddPlayerSheetProps {
  householdId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const empty = { first: "", last: "", dob: "", gender: "", preferred: "", school: "", jersey: "", conditions: "", allergies: "", medications: "", notes: "" };

/** Adds a child to the family's own household through the add_my_player function. */
export const AddPlayerSheet = ({ householdId, open, onOpenChange, onSaved }: AddPlayerSheetProps) => {
  const [f, setF] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) { setF(empty); setErr(null); }
  }, [open]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    const { error } = await supabase.rpc("add_my_player", {
      _household_id: householdId, _first_name: f.first, _last_name: f.last, _date_of_birth: f.dob,
      _gender: f.gender || null, _preferred_name: f.preferred, _school: f.school, _jersey_size: f.jersey,
      _conditions: f.conditions, _allergies: f.allergies, _medications: f.medications, _medical_notes: f.notes,
    } as never);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    toast.success(`${f.preferred || f.first} added`);
    onSaved();
    onOpenChange(false);
  };

  const input = (id: keyof typeof f, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`ap-${id}`}>{label}</Label>
      <Input id={`ap-${id}`} value={f[id]} onChange={set(id)} className="h-11" {...props} />
    </div>
  );
  const area = (id: keyof typeof f, label: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={`ap-${id}`}>{label}</Label>
      <Textarea id={`ap-${id}`} value={f[id]} onChange={set(id)} rows={2} />
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto sm:mx-auto sm:max-w-xl sm:rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle className="font-display text-2xl">Add a player</SheetTitle>
          <SheetDescription>Only your household and league staff can see this.</SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="mt-4 space-y-5 pb-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {input("first", "First name", { required: true })}
            {input("last", "Last name", { required: true })}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {input("dob", "Date of birth", { required: true, type: "date" })}
            <div className="space-y-1.5">
              <Label htmlFor="ap-gender">Gender (optional)</Label>
              <select id="ap-gender" value={f.gender} onChange={set("gender")} className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-base">
                <option value="">Choose</option>
                <option value="male">Boy</option>
                <option value="female">Girl</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {input("preferred", "Goes by (optional)")}
            {input("school", "School (optional)")}
          </div>
          {input("jersey", "Jersey size (optional)", { placeholder: "Youth M" })}
          <fieldset className="space-y-4">
            <legend className="font-label text-[17px] font-semibold">Medical (optional)</legend>
            {area("allergies", "Allergies")}
            {area("conditions", "Conditions")}
            {area("medications", "Medications")}
            {area("notes", "Anything else coaches should know")}
          </fieldset>
          {err && <p role="alert" className="text-sm font-semibold text-destructive">{err}</p>}
          <Button type="submit" disabled={saving} className="h-12 w-full rounded-full text-base">
            {saving ? "Saving" : "Add player"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddPlayerSheet;
