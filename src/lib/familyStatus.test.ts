import { describe, it, expect } from "vitest";
import { familyActions, formsChip, payChip, seatChip, type RegStatus } from "./familyStatus";

const base: RegStatus = {
  registration_id: "r1", player_id: "p1", program_name: "In-House", division_name: "Pinto", lifecycle: "submitted", seat: "held",
  on_hold_until: "2027-01-10T18:00:00Z", hold_reason: "checkout", forms_signed: 2, forms_required: 4, next_form_title: "Concussion",
  payment: "unpaid", amount_due: 225, due_on: null, reference_code: null, pay_by_check: false, checkout_id: "c1",
};
const name = () => "Ava";

describe("family status", () => {
  it("forms shows N of required and the next form", () => {
    expect(formsChip(base)).toMatchObject({ chip: "2 of 4", sub: "Next to sign: Concussion" });
    expect(formsChip({ ...base, forms_signed: 4 }).chip).toBe("Signed");
  });
  it("pay shows the amount due by the hold date", () => {
    expect(payChip(base).sub).toBe("$225 due by Jan 10");
    expect(payChip({ ...base, payment: "paid" }).chip).toBe("Paid");
    expect(payChip({ ...base, pay_by_check: true, reference_code: "CDBL-AB12", due_on: "2027-01-31" }).sub).toBe("Reference CDBL-AB12, due Jan 31");
  });
  it("seat shows saved until, confirmed, waitlisted", () => {
    expect(seatChip(base).sub).toBe("Saved until Jan 10");
    expect(seatChip({ ...base, seat: "confirmed" }).chip).toBe("Confirmed");
    expect(seatChip({ ...base, seat: "waitlisted" }).chip).toBe("Waitlisted");
  });
  it("a failed payment outranks paying and forms", () => {
    const acts = familyActions([base, { ...base, registration_id: "r2", player_id: "p2", hold_reason: "payment_failed", checkout_id: "c2" }], name);
    expect(acts[0].key).toBe("fail-r2");
    expect(acts[1].key).toBe("pay-c1");
    expect(acts[2].key).toBe("forms-r1");
  });
  it("one pay action per checkout", () => {
    const acts = familyActions([base, { ...base, registration_id: "r2", player_id: "p2" }], name);
    expect(acts.filter((a) => a.key.startsWith("pay-")).length).toBe(1);
  });
});
