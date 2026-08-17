import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const HouseholdNew = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      if (data.session?.user?.email && !name) {
        const guess = data.session.user.email.split("@")[0];
        setName(`${guess.charAt(0).toUpperCase()}${guess.slice(1)} Household`);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authed === false) return <Navigate to="/login?next=/household/new" replace />;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a household name.");
      return;
    }
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    const email = userData.user?.email ?? null;
    if (!uid) {
      toast.error("Session expired. Please sign in again.");
      setSaving(false);
      navigate("/login");
      return;
    }

    // Belt-and-suspenders: never create a second household for a guardian who
    // already has one (the old broken embed caused duplicate-creation laps).
    const { data: existingGuardianRow, error: existingGuardianError } = await supabase
      .from("guardians")
      .select("id")
      .eq("auth_user_id", uid)
      .maybeSingle();

    if (existingGuardianError) {
      toast.error(existingGuardianError.message);
      setSaving(false);
      return;
    }

    if (existingGuardianRow?.id) {
      const { data: existingLink, error: existingLinkError } = await supabase
        .from("guardian_households")
        .select("household_id")
        .eq("guardian_id", existingGuardianRow.id)
        .limit(1)
        .maybeSingle();

      if (existingLinkError) {
        toast.error(existingLinkError.message);
        setSaving(false);
        return;
      }

      if (existingLink?.household_id) {
        navigate("/household", { replace: true });
        return;
      }
    }

    // NOTE: A parent-facing bootstrap policy is not yet in place. Until it lands,
    // these inserts will only succeed for admins. This UI is scaffolding.

    const { data: hh, error: hhError } = await supabase
      .from("households")
      .insert({ name: name.trim() })
      .select("id")
      .single();

    if (hhError || !hh) {
      toast.error(hhError?.message ?? "Could not create household.");
      setSaving(false);
      return;
    }

    // Ensure a guardians row for this auth user
    let guardianId: string | null = null;
    const { data: existingGuardian } = await supabase
      .from("guardians")
      .select("id")
      .eq("auth_user_id", uid)
      .maybeSingle();

    if (existingGuardian?.id) {
      guardianId = existingGuardian.id;
    } else {
      const { data: newGuardian, error: gError } = await supabase
        .from("guardians")
        .insert({ auth_user_id: uid, email })
        .select("id")
        .single();
      if (gError || !newGuardian) {
        toast.error(gError?.message ?? "Could not create guardian record.");
        setSaving(false);
        return;
      }
      guardianId = newGuardian.id;
    }

    const { error: linkError } = await supabase
      .from("guardian_households")
      .insert({ guardian_id: guardianId, household_id: hh.id, is_primary: true });

    if (linkError) {
      toast.error(linkError.message);
      setSaving(false);
      return;
    }

    toast.success("Household created!");
    navigate("/household", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-heading">Create your household</CardTitle>
          <CardDescription>
            Welcome! Let's set up your family record so you can register players and manage roster
            details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="name">Household name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="The Smith Family"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
                </>
              ) : (
                "Create household"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default HouseholdNew;
