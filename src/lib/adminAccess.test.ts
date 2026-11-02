import { describe, it, expect } from "vitest";
import { canAccessAdminPath } from "./adminAccess";

describe("admin section access", () => {
  it("admin opens everything", () => expect(canAccessAdminPath(["admin"], "/admin/reports")).toBe(true));
  it("commissioner opens teams and drafts", () => {
    expect(canAccessAdminPath(["commissioner"], "/admin/teams")).toBe(true);
    expect(canAccessAdminPath(["commissioner"], "/admin/drafts/abc/live")).toBe(true);
  });
  it("commissioner cannot open registration codes", () => expect(canAccessAdminPath(["commissioner"], "/admin/registration-codes")).toBe(false));
  it("registrar opens players", () => expect(canAccessAdminPath(["registrar"], "/admin/players/1")).toBe(true));
  it("treasurer cannot open players", () => expect(canAccessAdminPath(["treasurer"], "/admin/players")).toBe(false));
  it("background_checks opens coaches only", () => {
    expect(canAccessAdminPath(["background_checks"], "/admin/coaches")).toBe(true);
    expect(canAccessAdminPath(["background_checks"], "/admin/players")).toBe(false);
  });
  it("board member still blocked from admin-only reports", () => expect(canAccessAdminPath(["board_member"], "/admin/reports")).toBe(false));
  it("parent cannot open the admin home", () => expect(canAccessAdminPath(["parent"], "/admin")).toBe(false));
});
