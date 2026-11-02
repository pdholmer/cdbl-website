import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { MIN_PASSWORD_LENGTH, passwordProblem } from "@/lib/password";

/** Public page the reset email links to. Sets a new password for the recovery session. */
const ResetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const isRecoveryLink = window.location.hash.includes("type=recovery") || window.location.search.includes("code=");
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && isRecoveryLink)) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      setReady((r) => r ?? (data.session ? true : isRecoveryLink ? null : false));
    });
    const t = setTimeout(() => setReady((r) => r ?? false), 4000);
    return () => { sub.subscription.unsubscribe(); clearTimeout(t); };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = passwordProblem(password, confirm);
    if (problem) return toast.error(problem);
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password saved");
    navigate("/login", { replace: true });
  };

  return (
    <AuthShell title="New password">
      <Card className="tex-mesh w-full rounded-xl">
        <CardHeader>
          <CardTitle className="font-label text-xl">Set a new password</CardTitle>
          <CardDescription>At least {MIN_PASSWORD_LENGTH} characters.</CardDescription>
        </CardHeader>
        <CardContent>
          {ready === null ? (
            <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : ready === false ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This reset link has expired or was already used. Request a new one from the sign-in page.
              </p>
              <Button asChild className="h-12 w-full"><Link to="/login">Back to sign in</Link></Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="new-password">New password</Label>
                <PasswordInput id="new-password" autoComplete="new-password" value={password} onChange={setPassword} />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <PasswordInput id="confirm-password" autoComplete="new-password" value={confirm} onChange={setConfirm} />
              </div>
              <Button type="submit" className="h-12 w-full" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  );
};

export default ResetPassword;
