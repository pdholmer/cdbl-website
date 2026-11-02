import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Monitor, Moon, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FamilyHeader } from "@/components/family";
import { getThemePref, setThemePref, type ThemePref } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemePref; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "Device", Icon: Monitor },
];

const Account = () => {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pref, setPref] = useState<ThemePref>(getThemePref());

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
  }, []);

  if (authed === false) return <Navigate to="/login" replace />;

  const choose = (v: ThemePref) => {
    setPref(v);
    setThemePref(v);
  };

  return (
    <div className="min-h-screen bg-background">
      <FamilyHeader context="Account" />
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-5xl font-extrabold leading-none text-foreground">Account</h1>
        <section className="mt-8 rounded-lg border border-border bg-card p-5">
          <h2 className="font-label text-lg font-semibold text-foreground">Appearance</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Saved on this device. Device follows your phone or computer setting.
          </p>
          <div role="radiogroup" aria-label="Appearance" className="mt-4 grid grid-cols-3 gap-2">
            {OPTIONS.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={pref === value}
                onClick={() => choose(value)}
                className={cn(
                  "flex h-12 items-center justify-center gap-2 rounded-full border font-label text-sm font-semibold transition-colors",
                  pref === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Account;
