import { AuthShell } from "@/components/AuthShell";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { safeNext } from "@/lib/mfa";

const TwoStepSetup = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const start = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true }); return; }
      // Clear any half-finished setup so a fresh code can be shown.
      const { data: factors } = await supabase.auth.mfa.listFactors();
      if (factors?.totp?.some((f) => f.status === "verified")) {
        navigate(`/two-step/verify?next=${encodeURIComponent(next)}`, { replace: true });
        return;
      }
      for (const f of factors?.all ?? []) {
        if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Authenticator app" });
      if (error) { setError(error.message); return; }
      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
    };
    start();
  }, [navigate, next]);

  const confirm = async () => {
    if (!factorId || code.length !== 6) return;
    setBusy(true);
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
    if (chErr) { setBusy(false); toast.error(chErr.message); return; }
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code });
    setBusy(false);
    if (error) { setCode(""); toast.error("That code didn't match. Try the newest one in your app."); return; }
    toast.success("Two-step sign-in is on");
    navigate(next, { replace: true });
  };

  return (
    <AuthShell>
      <Card className="w-full rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Set up two-step sign-in</CardTitle>
          <CardDescription>
            Your role can see family and payment records, so the league asks for a code from an
            authenticator app each time you sign in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-5">
            <li>Open an authenticator app (Google Authenticator, 1Password, Authy, or iPhone Passwords).</li>
            <li>Scan this code, or type the setup key.</li>
            <li>Enter the 6-digit code the app shows.</li>
          </ol>
          <div className="flex justify-center">
            {qr ? (
              <img src={qr} alt="Setup code for your authenticator app" className="h-48 w-48 rounded-lg bg-card p-2" />
            ) : (
              !error && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            )}
          </div>
          {secret && (
            <p className="text-center text-xs text-muted-foreground break-all">
              Setup key: <span className="font-mono text-foreground select-all">{secret}</span>
            </p>
          )}
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode} inputMode="numeric" autoComplete="one-time-code">
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg" />)}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button className="w-full h-12" disabled={busy || code.length !== 6 || !factorId} onClick={confirm}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Turn on two-step sign-in
          </Button>
          <p className="text-xs text-muted-foreground">
            If you lose your phone, ask another league admin to reset your two-step sign-in.
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
};

export default TwoStepSetup;
