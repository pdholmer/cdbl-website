import { AuthShell } from "@/components/AuthShell";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { safeNext, ensureLiveSession, MFA_HELP } from "@/lib/mfa";

const TwoStepVerify = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!(await ensureLiveSession())) { navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true }); return; }
        const { data, error: lErr } = await supabase.auth.mfa.listFactors();
        if (lErr) throw lErr;
        const f = data?.totp?.find((x) => x.status === "verified");
        if (!f) { navigate(`/two-step/setup?next=${encodeURIComponent(next)}`, { replace: true }); return; }
        setFactorId(f.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't load two-step sign-in.");
      }
    };
    load();
  }, [navigate, next]);

  const verify = async (value = code) => {
    if (!factorId || value.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: value });
    if (error) {
      setBusy(false);
      setCode("");
      const wrong = /invalid|code/i.test(error.message) && !/session/i.test(error.message);
      setError(wrong ? "That code didn't match. Try the newest one in your app." : error.message);
      return;
    }
    // Pick up the upgraded (two-step) sign-in before the guard re-checks it.
    await supabase.auth.refreshSession();
    setBusy(false);
    navigate(next, { replace: true });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <AuthShell>
      <Card className="w-full rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Enter your code</CardTitle>
          <CardDescription>Open your authenticator app and type the 6-digit code for CDBL.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div role="alert" className="rounded-lg border border-destructive/40 p-3 text-sm">
              <p className="text-destructive">{error}</p>
              <p className="mt-1 text-muted-foreground">{MFA_HELP}</p>
            </div>
          )}
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(v) => { setCode(v); if (v.length === 6) verify(v); }}
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg" />)}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button className="w-full h-12" disabled={busy || code.length !== 6 || !factorId} onClick={() => verify()}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
          <Button variant="ghost" className="w-full h-11" onClick={signOut}>Sign out</Button>
        </CardContent>
      </Card>
    </AuthShell>
  );
};

export default TwoStepVerify;
