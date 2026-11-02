// Display helpers for the family registration flow. The database decides placement
// (division_eligibility) and whether a draft may start (start_my_registration); these only label it.

/** School grades the league uses: pre-K = -1, kindergarten = 0, then 1 to 12. */
export const GRADES: { value: number; label: string }[] = [
  { value: -1, label: "Pre-K" },
  { value: 0, label: "Kindergarten" },
  ...Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
    return { value: n, label: `${n}${suffix} grade` };
  }),
];

export const gradeLabel = (g: number | null | undefined) =>
  g === null || g === undefined ? "" : GRADES.find((x) => x.value === g)?.label ?? `Grade ${g}`;

export const gradeRangeLabel = (min: number | null, max: number | null) => {
  if (min === null || max === null) return "";
  return min === max ? gradeLabel(min) : `${gradeLabel(min)} to ${gradeLabel(max)}`;
};

export type WindowState = "before" | "open" | "late" | "closed" | "test";

/** Where today sits in the registration window. Dates are YYYY-MM-DD. */
export const registrationWindow = (
  today: string,
  opens: string | null,
  closes: string | null,
  lateUntil: string | null,
  testMode = false,
): WindowState => {
  if (testMode) return "test";
  if (!opens || today < opens) return "before";
  if (!closes || today <= closes) return "open";
  if (lateUntil && today <= lateUntil) return "late";
  return "closed";
};

export const longDate = (d: string | null) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "";

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
