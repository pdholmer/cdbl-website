// Family Home status words, derived only from my_registration_status() rows.
import type { ChipTone } from "@/components/family/StatusChip";

export interface RegStatus {
  registration_id: string;
  player_id: string;
  program_name: string | null;
  division_name: string | null;
  lifecycle: string;
  seat: string;
  on_hold_until: string | null;
  hold_reason: string | null;
  forms_signed: number;
  forms_required: number;
  next_form_title: string | null;
  payment: string;
  amount_due: number | null;
  due_on: string | null;
  reference_code: string | null;
  pay_by_check: boolean;
  checkout_id: string | null;
}

export interface Chip { chip: string; tone: ChipTone; sub?: string }

const shortDate = (iso: string | null) => {
  if (!iso) return "";
  const d = iso.length === 10 ? new Date(`${iso}T12:00:00`) : new Date(iso);
  if (d.getFullYear() > 9000) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" });
};
const money = (n: number) => `$${Number(n).toFixed(Number(n) % 1 ? 2 : 0)}`;

export const formsChip = (r: RegStatus): Chip => {
  if (r.forms_required > 0 && r.forms_signed >= r.forms_required) return { chip: "Signed", tone: "success", sub: `${r.forms_signed} of ${r.forms_required} signed` };
  return {
    chip: `${r.forms_signed} of ${r.forms_required}`,
    tone: "warning",
    sub: r.next_form_title ? `Next to sign: ${r.next_form_title}` : undefined,
  };
};

export const payChip = (r: RegStatus): Chip => {
  const due = Number(r.amount_due ?? 0);
  if (r.payment === "waived" || r.payment === "paid" || (r.checkout_id && due <= 0 && r.lifecycle === "active")) return { chip: "Paid", tone: "success" };
  if (r.hold_reason === "payment_failed") return { chip: "Unpaid", tone: "destructive", sub: "The bank payment didn't go through. The registrar will call you." };
  if (!r.checkout_id) return { chip: "Not started", tone: "neutral", sub: "Pay after choosing a program." };
  if (r.pay_by_check && r.reference_code) return { chip: "Pay by check", tone: "warning", sub: `Reference ${r.reference_code}, due ${shortDate(r.due_on)}` };
  const by = r.due_on ?? r.on_hold_until;
  return { chip: "Due", tone: "warning", sub: `${money(due)} due${by ? ` by ${shortDate(by)}` : ""}` };
};

export const seatChip = (r: RegStatus): Chip => {
  if (r.seat === "confirmed") return { chip: "Confirmed", tone: "success" };
  if (r.seat === "waitlisted") return { chip: "Waitlisted", tone: "neutral", sub: "The registrar will email you if a spot opens." };
  if (r.seat === "held") {
    const until = shortDate(r.on_hold_until);
    return { chip: "Saved", tone: "warning", sub: until ? `Saved until ${until}` : "Saved while the league reviews your request" };
  }
  return { chip: "Not saved yet", tone: "neutral" };
};

export interface FamilyAction { key: string; task: string; why: string; chip: string; tone: ChipTone; to?: string; label?: string; rank: number }

/** Rank: failed payment, spot about to lapse, forms, check to mail, waitlist. Lower rank is more important. */
export const familyActions = (rows: RegStatus[], nameOf: (playerId: string) => string): FamilyAction[] => {
  const out: FamilyAction[] = [];
  const carts = new Set<string>();
  for (const r of rows) {
    const name = nameOf(r.player_id);
    const pay = payChip(r);
    if (r.hold_reason === "payment_failed") {
      out.push({ key: `fail-${r.registration_id}`, rank: 0, task: `Fix ${name}'s payment`, why: "The bank payment didn't go through. Pay another way to keep the spot.", chip: "Unpaid", tone: "destructive", to: "/household/checkout", label: "Pay now" });
      continue;
    }
    if (r.seat === "held" && r.hold_reason === "checkout" && pay.chip === "Due" && r.checkout_id && !carts.has(r.checkout_id)) {
      carts.add(r.checkout_id);
      out.push({ key: `pay-${r.checkout_id}`, rank: 1, task: `Finish paying for ${name}`, why: `${pay.sub}. The spot is saved until then.`, chip: "Due", tone: "warning", to: "/household/checkout", label: "Finish paying" });
    }
    if (r.lifecycle !== "draft" && r.forms_signed < r.forms_required) {
      out.push({ key: `forms-${r.registration_id}`, rank: 2, task: `Sign ${name}'s forms`, why: `${r.forms_signed} of ${r.forms_required} signed.${r.next_form_title ? ` Next: ${r.next_form_title}.` : ""}`, chip: "Due", tone: "warning", to: `/household/register/${r.player_id}`, label: "Sign forms" });
    }
    if (pay.chip === "Pay by check" && r.checkout_id && !carts.has(r.checkout_id)) {
      carts.add(r.checkout_id);
      out.push({ key: `check-${r.checkout_id}`, rank: 3, task: `Mail your check for ${name}`, why: `Write ${r.reference_code} on the check. ${pay.sub?.replace(/^Reference \S+, /, "")}.`, chip: "Pay by check", tone: "warning" });
    }
    if (r.seat === "waitlisted") {
      out.push({ key: `wait-${r.registration_id}`, rank: 4, task: `${name} is on the waitlist`, why: "The registrar will email you if a spot opens.", chip: "Waitlisted", tone: "neutral" });
    }
  }
  return out.sort((a, b) => a.rank - b.rank);
};
