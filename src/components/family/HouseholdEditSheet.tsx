import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { HouseholdRecord } from "@/hooks/useHouseholdOverview";

interface HouseholdEditSheetProps {
  household: HouseholdRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export const HouseholdEditSheet = ({
  household,
  open,
  onOpenChange,
  onSaved,
}: HouseholdEditSheetProps) => {
  const [form, setForm] = useState(household);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(household);
  }, [open, household]);

  const set = (key: keyof HouseholdRecord) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("households")
      .update({
        name: form.name,
        address_line1: form.address_line1,
        address_line2: form.address_line2,
        city: form.city,
        state: form.state,
        zip_code: form.zip_code,
      })
      .eq("id", household.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Household updated");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl sm:max-w-[640px] sm:mx-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="font-heading">Edit household</SheetTitle>
          <SheetDescription>
            Used for league mailings and field directions.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3 pb-4">
          <div className="space-y-1.5">
            <Label htmlFor="hh-name">Household name</Label>
            <Input id="hh-name" value={form.name ?? ""} onChange={set("name")} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hh-addr1">Street address</Label>
            <Input id="hh-addr1" value={form.address_line1 ?? ""} onChange={set("address_line1")} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hh-addr2">Apt, suite (optional)</Label>
            <Input id="hh-addr2" value={form.address_line2 ?? ""} onChange={set("address_line2")} className="h-11" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hh-city">City</Label>
              <Input id="hh-city" value={form.city ?? ""} onChange={set("city")} className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="hh-state">State</Label>
                <Input id="hh-state" value={form.state ?? ""} onChange={set("state")} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hh-zip">ZIP</Label>
                <Input id="hh-zip" value={form.zip_code ?? ""} onChange={set("zip_code")} className="h-11" />
              </div>
            </div>
          </div>
          <Button onClick={save} disabled={saving} className="h-12 w-full rounded-xl">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HouseholdEditSheet;
