import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { safeNext } from "@/lib/mfa";

const TwoStepVerify = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true }); return; }
      const { data } = await supabase.auth.mfa.listFactors();
      const f = data?.totp?.find((x) => x.status === "verified");
      if (!f) { navigate(`/two-step/setup?next=${encodeURIComponent(next)}`, { replace: true }); return; }
      setFactorId(f.id);
    };
    load();
  }, [navigate, next]);

  const verify = async (value = code) => {
    if (!factorId || value.length !== 6) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: value });
    setBusy(false);
    if (error) { setCode(""); toast.error("That code didn't match. Try the newest one in your app."); return; }
    navigate(next, { replace: true });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Enter your code</CardTitle>
          <CardDescription>Open your authenticator app and type the 6-digit code for CDBL.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
    </div>
  );
};

export default TwoStepVerify;
