import { AuthShell } from "@/components/AuthShell";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2 } from "lucide-react";
import { safeNext, ensureLiveSession, MFA_HELP, emailCode, getMfaStatus, saveDeviceToken } from "@/lib/mfa";

type Mode = "email" | "app";

const lockMsg = (until?: unknown) => {
  const t = typeof until === "string" ? new Date(until) : null;
  return t
    ? `Too many wrong codes. Try again after ${t.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`
    : "Too many wrong codes. Try again in 15 minutes.";
};

const TwoStepVerify = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const [userId, setUserId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("email");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [trust, setTrust] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [wait, setWait] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const sentOnce = useRef(false);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const send = useCallback(async () => {
    setSending(true);
    setError(null);
    const r = await emailCode<{ sentTo: string; retryAfter: number }>({ action: "send" });
    setSending(false);
    if (r.ok) {
      setSentTo((r as { sentTo?: string }).sentTo ?? "your email");
      setWait(Number((r as { retryAfter?: number }).retryAfter ?? 60));
      return;
    }
    const e = r as Record<string, unknown>;
    if (e.error === "too_soon") { setWait(Number(e.retryAfter ?? 60)); setSentTo((s) => s ?? "your email"); return; }
    if (e.error === "hourly_limit") setError("You've asked for 10 codes this hour. Wait a bit, then try again.");
    else if (e.error === "locked") setError(lockMsg(e.until));
    else if (e.error === "email_blocked") setError("Email to this address is turned off, so we can't send a code.");
    else if (e.error === "unauthorized") setError("Your sign-in has ended. Sign out, then sign in again.");
    else setError("We couldn't send your code.");
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        if (!(await ensureLiveSession())) { navigate(`/login?next=${encodeURIComponent(next)}`, { replace: true }); return; }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        // Already passed (trusted device or earlier code in this session)?
        if ((await getMfaStatus(user.id)) !== "needs_code") { navigate(next, { replace: true }); return; }
        const { data } = await supabase.auth.mfa.listFactors();
        const f = data?.totp?.find((x) => x.status === "verified");
        if (f) setFactorId(f.id);
        if (!sentOnce.current) { sentOnce.current = true; send(); }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't load two-step sign-in.");
      }
    };
    load();
  }, [navigate, next, send]);

  const verify = async (value = code) => {
    if (value.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    if (mode === "app") {
      if (!factorId) { setBusy(false); return; }
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: value });
      if (error) {
        setBusy(false);
        setCode("");
        const wrong = /invalid|code/i.test(error.message) && !/session/i.test(error.message);
        setError(wrong ? "That code didn't match. Try the newest one in your app." : error.message);
        return;
      }
      await supabase.auth.refreshSession();
      setBusy(false);
      navigate(next, { replace: true });
      return;
    }
    const r = await emailCode<{ deviceToken?: string }>({ action: "verify", code: value, trustDevice: trust });
    setBusy(false);
    if (r.ok) {
      const token = (r as { deviceToken?: string }).deviceToken;
      if (token && userId) saveDeviceToken(userId, token);
      navigate(next, { replace: true });
      return;
    }
    setCode("");
    const e = r as Record<string, unknown>;
    if (e.error === "wrong_code") setError(`That code didn't match. ${e.triesLeft} ${e.triesLeft === 1 ? "try" : "tries"} left.`);
    else if (e.error === "expired") setError("That code has expired or was replaced. Send a new one.");
    else if (e.error === "locked") setError(lockMsg(e.until));
    else setError("We couldn't check your code.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  };

  const switchMode = (m: Mode) => { setMode(m); setCode(""); setError(null); };

  return (
    <AuthShell>
      <div className="w-full rounded-lg border border-border bg-card p-6 sm:p-8">
        <h1 className="font-display text-4xl font-extrabold leading-none text-foreground">Enter your code</h1>
        <p className="mt-3 text-base text-muted-foreground" aria-live="polite">
          {mode === "app"
            ? "Open your authenticator app and type the 6-digit code for CDBL."
            : sentTo
              ? `We emailed a 6-digit code to ${sentTo}. It works for 10 minutes.`
              : sending ? "Sending your code…" : "We'll email you a 6-digit code."}
        </p>

        {error && (
          <div role="alert" className="mt-5 rounded-lg border border-destructive/40 p-3 text-sm">
            <p className="text-destructive">{error}</p>
            <p className="mt-1 text-muted-foreground">{MFA_HELP}</p>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(v) => { setCode(v); if (v.length === 6) verify(v); }}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            aria-label="6-digit code"
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg" />)}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {mode === "email" && (
          <label className="mt-6 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-foreground">
            <Checkbox checked={trust} onCheckedChange={(v) => setTrust(v === true)} />
            Trust this device for 30 days
          </label>
        )}

        <Button className="mt-4 h-12 w-full" disabled={busy || code.length !== 6} onClick={() => verify()}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
        </Button>

        <div className="mt-3 flex flex-col gap-1">
          {mode === "email" && (
            <Button variant="ghost" className="h-11" disabled={sending || wait > 0} onClick={send}>
              {wait > 0 ? `Send a new code in ${wait}s` : "Send a new code"}
            </Button>
          )}
          {factorId && (
            <Button variant="ghost" className="h-11" onClick={() => switchMode(mode === "email" ? "app" : "email")}>
              {mode === "email" ? "Use authenticator app instead" : "Email me a code instead"}
            </Button>
          )}
          <Button variant="ghost" className="h-11 text-muted-foreground" onClick={signOut}>Sign out</Button>
        </div>
      </div>
    </AuthShell>
  );
};

export default TwoStepVerify;
