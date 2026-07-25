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
    if (!uid) {
      toast.error("Session expired. Please sign in again.");
      setSaving(false);
      navigate("/login");
      return;
    }
    const { data: hh, error } = await supabase
      .from("guardian_households")
      .insert({ name: name.trim(), created_by: uid })
      .select("id")
      .single();

    if (error || !hh) {
      toast.error(error?.message ?? "Could not create household.");
      setSaving(false);
      return;
    }

    const { error: memberError } = await supabase
      .from("guardian_household_members")
      .insert({ household_id: hh.id, user_id: uid, role: "owner" });

    if (memberError) {
      toast.error(memberError.message);
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
