import { describe, it, expect } from "vitest";
import { owedSummary, toCsv, type RegRow } from "./registrationsList";

const r = (o: Partial<RegRow>): RegRow => ({
  registration_id: "r", player_id: "p", player_name: "Ava Test", household_id: "h1", household_name: "Test", program_name: "In-House", program_type: "in_house",
  program_id: "x", division_id: "d", division_name: "Pinto", lifecycle: "submitted", seat: "held", waiver_status: "signed",
  forms_signed: 4, forms_required: 4, payment: "unpaid", amount_due: 450, hold_reason: null, on_hold_until: null, ...o,
});

describe("draft day owed summary", () => {
  it("counts a family once with siblings in one checkout", () => {
    expect(owedSummary([r({}), r({ registration_id: "r2", player_name: "Ben" }), r({ household_id: "h2", amount_due: 225 }), r({ household_id: "h3", payment: "paid", amount_due: 0 })]))
      .toEqual({ families: 2, total: 675, players: 3 });
  });
  it("commissioner export has no family or amount columns", () => {
    const csv = toCsv([r({ household_name: null, amount_due: null })], false, true);
    expect(csv.split("\n")[0]).toBe("Player,Division,Payment,Forms");
  });
});
