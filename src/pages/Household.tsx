import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

type Household = { id: string; name: string };

const Household = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(true);
  const [household, setHousehold] = useState<Household | null>(null);
  const [needsCreate, setNeedsCreate] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setAuthed(false);
        setLoading(false);
        return;
      }
      const { data: membership } = await supabase
        .from("guardian_household_members")
        .select("household_id, guardian_households:household_id(id, name)")
        .eq("user_id", session.user.id)
        .limit(1)
        .maybeSingle();

      const hh = (membership as any)?.guardian_households as Household | undefined;
      if (!hh) {
        setNeedsCreate(true);
      } else {
        setHousehold(hh);
      }
      setLoading(false);
    })();
  }, []);

  if (!authed) return <Navigate to="/login?next=/household" replace />;
  if (needsCreate) return <Navigate to="/household/new" replace />;

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="font-heading text-2xl">{household?.name}</CardTitle>
                <CardDescription>Your household dashboard</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This is a placeholder for your household dashboard. Player registrations, roster
                assignments, and family details will live here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Household;
