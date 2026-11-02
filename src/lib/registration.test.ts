import { describe, it, expect } from "vitest";
import { registrationWindow, gradeLabel } from "./registration";

const O = "2026-12-21", C = "2027-03-06", L = "2027-03-13";

describe("2027 registration window", () => {
  it("is not open before Dec 21 2026", () => {
    expect(registrationWindow("2026-12-20", O, C, L)).toBe("before");
  });
  it("opens on Dec 21 2026", () => {
    expect(registrationWindow("2026-12-21", O, C, L)).toBe("open");
  });
  it("is still open on Mar 6 2027", () => {
    expect(registrationWindow("2027-03-06", O, C, L)).toBe("open");
  });
  it("takes late registrations until Mar 13 2027", () => {
    expect(registrationWindow("2027-03-07", O, C, L)).toBe("late");
    expect(registrationWindow("2027-03-13", O, C, L)).toBe("late");
  });
  it("is closed after Mar 13 2027", () => {
    expect(registrationWindow("2027-03-14", O, C, L)).toBe("closed");
  });
  it("test mode lets drafts start early", () => {
    expect(registrationWindow("2026-11-02", O, C, L, true)).toBe("test");
  });
});

describe("grade numbering", () => {
  it("pre-K is -1 and kindergarten is 0", () => {
    expect(gradeLabel(-1)).toBe("Pre-K");
    expect(gradeLabel(0)).toBe("Kindergarten");
    expect(gradeLabel(2)).toBe("2nd grade");
  });
});
