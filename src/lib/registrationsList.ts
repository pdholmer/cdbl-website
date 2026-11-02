export interface RegRow {
  registration_id: string; player_id: string; player_name: string; household_id: string | null; household_name: string | null;
  program_name: string | null; program_type: string | null; program_id: string; division_id: string | null; division_name: string | null;
  lifecycle: string; seat: string; waiver_status: string; forms_signed: number; forms_required: number;
  payment: string; amount_due: number | null; hold_reason: string | null; on_hold_until: string | null;
}

const owes = (r: RegRow) => r.lifecycle !== "cancelled" && r.payment !== "paid" && r.payment !== "waived";

/** "N families owe $X": a family is counted once, its balance once per checkout (amount_due is per checkout). */
export const owedSummary = (rows: RegRow[]) => {
  const fam = new Map<string, number>();
  for (const r of rows) {
    if (!owes(r) || r.household_id == null || r.amount_due == null || Number(r.amount_due) <= 0) continue;
    fam.set(r.household_id, Math.max(fam.get(r.household_id) ?? 0, Number(r.amount_due)));
  }
  return { families: fam.size, total: [...fam.values()].reduce((a, b) => a + b, 0), players: rows.filter(owes).length };
};

const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCsv = (rows: RegRow[], money: boolean, draftDay: boolean) => {
  const cols: [string, (r: RegRow) => unknown][] = draftDay
    ? [["Player", (r) => r.player_name], ["Division", (r) => r.division_name], ["Payment", (r) => r.payment], ["Forms", (r) => (r.forms_signed >= r.forms_required ? "signed" : "pending")]]
    : [["Player", (r) => r.player_name], ["Program", (r) => r.program_name], ["Division", (r) => r.division_name], ["Status", (r) => r.lifecycle], ["Spot", (r) => r.seat],
       ["Forms signed", (r) => r.forms_signed], ["Forms required", (r) => r.forms_required], ["Payment", (r) => r.payment], ["Hold", (r) => r.hold_reason]];
  if (money) cols.splice(1, 0, ["Family", (r) => r.household_name]);
  if (money && !draftDay) cols.push(["Amount due", (r) => r.amount_due]);
  return [cols.map((c) => c[0]).join(","), ...rows.map((r) => cols.map((c) => cell(c[1](r))).join(","))].join("\n");
};
