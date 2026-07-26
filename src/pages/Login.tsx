import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";

type Stage = "enter" | "sent";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rawNext = params.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;

  const [stage, setStage] = useState<Stage>("enter");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // If already signed in, route immediately.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) routeAfterLogin();
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) routeAfterLogin();
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const routeAfterLogin = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;

    // Honor same-origin next if the user was redirected in
    if (next && !next.startsWith("/login") && !next.startsWith("/household")) {
      navigate(next, { replace: true });
      return;
    }

    const { data: guardian } = await supabase
      .from("guardians")
      .select("id, guardian_households(household_id)")
      .eq("auth_user_id", uid)
      .limit(1)
      .maybeSingle();

    const hasHousehold =
      !!guardian &&
      Array.isArray((guardian as any).guardian_households) &&
      (guardian as any).guardian_households.length > 0;

    if (hasHousehold) {
      navigate("/household", { replace: true });
    } else {
      navigate("/household/new", { replace: true });
    }
  };

  const sendCode = async (targetEmail: string) => {
    // Check hard-bounce list first (best-effort; RLS may hide, that's fine)
    const { data: bounce } = await supabase
      .from("email_bounces")
      .select("id")
      .ilike("email", targetEmail)
      .eq("resolved", false)
      .limit(1)
      .maybeSingle();
    if (bounce) {
      toast.error(
        "We can't reach that email address. Please contact an administrator so we can look into it."
      );
      return false;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: targetEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        shouldCreateUser: true,
      },
    });
    if (error) {
      toast.error(error.message);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const a = email.trim().toLowerCase();
    const b = confirmEmail.trim().toLowerCase();

    if (!emailRegex.test(a)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (a !== b) {
      toast.error("The two email addresses don't match.");
      return;
    }

    setSending(true);
    const ok = await sendCode(a);
    setSending(false);
    if (ok) {
      setEmail(a);
      setStage("sent");
      toast.success("Login link and code sent.");
    }
  };

  const handleResend = async () => {
    setSending(true);
    const ok = await sendCode(email);
    setSending(false);
    if (ok) toast.success("Sent again — check your inbox.");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.trim();
    if (!/^\d{6}$/.test(token)) {
      toast.error("Enter the 6-digit code from your email.");
      return;
    }
    setVerifying(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    setVerifying(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // onAuthStateChange will route
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        {stage === "enter" ? (
          <>
            <CardHeader>
              <CardTitle className="font-heading">Sign in to CDBL</CardTitle>
              <CardDescription>
                Enter your email twice. We'll send you a magic link and a 6-digit code — use whichever
                is easier.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirm">Confirm email</Label>
                  <Input
                    id="confirm"
                    type="email"
                    autoComplete="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    onPaste={(e) => {
                      // Discourage paste to catch typos.
                      e.preventDefault();
                      toast.info("Please retype your email to confirm.");
                    }}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={sending}>
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    "Send login link & code"
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-heading text-center">Check your email</CardTitle>
              <CardDescription className="text-center">
                We sent a magic link and a 6-digit code to:
              </CardDescription>
              <p className="mt-3 text-center text-xl md:text-2xl font-heading font-semibold break-all">
                {email}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <Label htmlFor="otp">Enter the 6-digit code</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="\d{6}"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                />
                <Button type="submit" className="w-full" disabled={verifying}>
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…
                    </>
                  ) : (
                    "Verify code"
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center">
                Or just click the magic link in the email — it'll sign you in automatically.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStage("enter");
                    setOtp("");
                    setConfirmEmail("");
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Edit email
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleResend}
                  disabled={sending}
                >
                  {sending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Resend
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default Login;
