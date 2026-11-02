import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { resolveLanding } from "@/lib/landing";
import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { MIN_PASSWORD_LENGTH, passwordProblem } from "@/lib/password";

type Mode = "signin" | "signup" | "forgot" | "forgot-sent" | "signup-sent" | "unconfirmed";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rawNext = params.get("next");
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;

  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [routeError, setRouteError] = useState(false);

  // If already signed in, route immediately.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && event === "SIGNED_IN") routeAfterLogin();
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

    if (next && !next.startsWith("/login") && !next.startsWith("/admin/login")) {
      navigate(next, { replace: true });
      return;
    }

    // Role-aware landing. /admin and /coach run the two-step check themselves.
    try {
      const landing = await resolveLanding(uid);
      setRouteError(false);
      navigate(landing, { replace: true });
    } catch {
      setRouteError(true);
    }
  };

  const cleanEmail = () => email.trim().toLowerCase();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const a = cleanEmail();
    if (!emailRegex.test(a)) return toast.error("Please enter a valid email address.");
    if (!password) return toast.error("Enter your password.");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: a, password });
    setBusy(false);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setMode("unconfirmed");
        return;
      }
      toast.error(
        error.message === "Invalid login credentials"
          ? "That email and password don't match. If you've never set a password, use Forgot password."
          : error.message,
      );
    }
    // onAuthStateChange routes on success
  };

  const handleResendConfirmation = async () => {
    const a = cleanEmail();
    if (!emailRegex.test(a)) return toast.error("Please enter a valid email address.");
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: a,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Confirmation email sent. Check your inbox.");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const a = cleanEmail();
    if (!emailRegex.test(a)) return toast.error("Please enter a valid email address.");
    const problem = passwordProblem(password, confirm);
    if (problem) return toast.error(problem);
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: a,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (!data.session) setMode("signup-sent");
    // With a session, onAuthStateChange routes.
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const a = cleanEmail();
    if (!emailRegex.test(a)) return toast.error("Please enter a valid email address.");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(a, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setMode("forgot-sent");
  };

  const switchTo = (m: Mode) => {
    setPassword("");
    setConfirm("");
    setMode(m);
  };

  const emailField = (
    <div>
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        autoComplete="email"
        className="h-11"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
    </div>
  );

  const backLink = (
    <Button variant="ghost" className="h-11 w-full" onClick={() => switchTo("signin")}>
      <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
    </Button>
  );

  return (
    <AuthShell>
      {routeError && (
        <div role="alert" className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="font-semibold">You're signed in, but we couldn't check your access.</p>
          <Button className="mt-3 h-11 rounded-xl" onClick={() => routeAfterLogin()}>Try again</Button>
        </div>
      )}
      <Card className="w-full rounded-2xl shadow-md">
        {mode === "signin" && (
          <>
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Sign in to CDBL</CardTitle>
              <CardDescription>Use your email and password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                {emailField}
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      className="min-h-11 px-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                      onClick={() => switchTo("forgot")}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <PasswordInput id="password" autoComplete="current-password" value={password} onChange={setPassword} />
                </div>
                <Button type="submit" className="h-12 w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign in
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                New to CDBL?{" "}
                <button
                  type="button"
                  className="min-h-11 font-semibold text-primary underline-offset-4 hover:underline"
                  onClick={() => switchTo("signup")}
                >
                  Create account
                </button>
              </p>
              <p className="text-center text-xs text-muted-foreground">
                Used an email link before? Choose Forgot password to set a password.
              </p>
            </CardContent>
          </>
        )}

        {mode === "signup" && (
          <>
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Create your account</CardTitle>
              <CardDescription>Passwords need at least {MIN_PASSWORD_LENGTH} characters.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="space-y-4">
                {emailField}
                <div>
                  <Label htmlFor="new-password">Password</Label>
                  <PasswordInput id="new-password" autoComplete="new-password" value={password} onChange={setPassword} />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <PasswordInput id="confirm-password" autoComplete="new-password" value={confirm} onChange={setConfirm} />
                </div>
                <Button type="submit" className="h-12 w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create account
                </Button>
              </form>
              <div className="mt-4">{backLink}</div>
            </CardContent>
          </>
        )}

        {mode === "forgot" && (
          <>
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Reset your password</CardTitle>
              <CardDescription>
                We'll email you a link to set a new password. This also works if you've never had one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgot} className="space-y-4">
                {emailField}
                <Button type="submit" className="h-12 w-full" disabled={busy}>
                  {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send reset link
                </Button>
              </form>
              <div className="mt-4">{backLink}</div>
            </CardContent>
          </>
        )}

        {(mode === "forgot-sent" || mode === "signup-sent") && (
          <>
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-heading text-2xl">Check your email</CardTitle>
              <CardDescription>
                {mode === "forgot-sent"
                  ? "If there's an account for this address, a reset link is on its way to:"
                  : "Confirm your address to finish creating your account. We sent a link to:"}
              </CardDescription>
              <p className="mt-2 break-all font-heading text-xl font-semibold">{cleanEmail()}</p>
            </CardHeader>
            <CardContent>{backLink}</CardContent>
          </>
        )}
      </Card>
    </AuthShell>
  );
};

export default Login;
