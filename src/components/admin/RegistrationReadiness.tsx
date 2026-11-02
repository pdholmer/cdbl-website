import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusChip } from "@/components/family/StatusChip";
import { Skeleton } from "@/components/ui/skeleton";

type R = {
  season: string; opens_on: string; webhook_seen: boolean; placeholder_forms: string[]; cutoff_confirmed: boolean;
  grade_ranges_unconfirmed: string[]; colt_fee_confirmed: boolean; clinic_confirmed: boolean; fees_confirmed: boolean; mailing_zip_set: boolean;
};
type Keys = { stripe_key_set: boolean; stripe_key_is_live: boolean; webhook_secret_set: boolean; resend_key_set: boolean };

/** What is still missing before registration opens. Key checks report only set or not set, never values. */
const RegistrationReadiness = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["registration-readiness"],
    queryFn: async () => {
      const [{ data: r, error }, keys] = await Promise.all([
        supabase.rpc("registration_readiness"),
        supabase.functions.invoke("stripe-checkout", { body: { action: "readiness" } }),
      ]);
      if (error) throw error;
      return { r: r as unknown as R, k: (keys.data ?? null) as Keys | null };
    },
  });
  if (isLoading) return <Skeleton className="h-40 w-full rounded-xl" />;
  if (!data) return null;
  const { r, k } = data;
  const rows: { label: string; ok: boolean; detail?: string }[] = [
    { label: "Stripe test key", ok: !!k?.stripe_key_set, detail: k?.stripe_key_is_live ? "A live key is set. Use a test key until the board approves." : k ? undefined : "Couldn't check the keys." },
    { label: "Stripe webhook secret", ok: !!k?.webhook_secret_set },
    { label: "Webhook verified with a real test payment", ok: r.webhook_seen },
    { label: "Email sending key", ok: !!k?.resend_key_set },
    { label: "Form wording final", ok: r.placeholder_forms.length === 0, detail: r.placeholder_forms.length ? `Still placeholder: ${r.placeholder_forms.join(", ")}` : undefined },
    { label: "Age cutoff confirmed", ok: r.cutoff_confirmed },
    { label: "Grade ranges confirmed", ok: r.grade_ranges_unconfirmed.length === 0, detail: r.grade_ranges_unconfirmed.length ? `Unconfirmed: ${r.grade_ranges_unconfirmed.join(", ")}` : undefined },
    { label: "Colt fee confirmed", ok: r.colt_fee_confirmed },
    { label: "Clinic confirmed", ok: r.clinic_confirmed },
    { label: "Early bird and late fee confirmed", ok: r.fees_confirmed },
    { label: "Mailing address ZIP code", ok: r.mailing_zip_set, detail: r.mailing_zip_set ? undefined : "Check instructions show P.O. Box 5551, Elgin, IL with no ZIP." },
  ];
  const left = rows.filter((x) => !x.ok).length;
  return (
    <section className="tex-mesh space-y-3 rounded-xl border border-border bg-card p-5" aria-label="Registration readiness">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-label text-[17px] font-semibold">Ready to open {r.opens_on ? new Date(`${r.opens_on}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}?</p>
        <StatusChip tone={left ? "warning" : "success"}>{left ? `${left} still missing` : "Ready"}</StatusChip>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((x) => (
          <li key={x.label} className="flex min-h-[44px] items-center justify-between gap-3 py-2 text-[15px]">
            <span className="min-w-0">
              <span className="block">{x.label}</span>
              {x.detail && <span className="block text-sm text-muted-foreground">{x.detail}</span>}
            </span>
            <StatusChip tone={x.ok ? "success" : "warning"}>{x.ok ? "Done" : "Missing"}</StatusChip>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RegistrationReadiness;
