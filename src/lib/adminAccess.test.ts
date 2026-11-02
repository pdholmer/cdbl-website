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
  it("treasurer cannot open requests", () => expect(canAccessAdminPath(["treasurer"], "/admin/requests")).toBe(false));
  it("board member can open requests", () => expect(canAccessAdminPath(["board_member"], "/admin/requests/abc")).toBe(true));
});

describe("phase 6 league office pages", () => {
  it("worklist is registrar and admin only", () => {
    expect(canAccessAdminPath(["registrar"], "/admin/worklist")).toBe(true);
    expect(canAccessAdminPath(["board_member"], "/admin/worklist")).toBe(false);
    expect(canAccessAdminPath(["commissioner"], "/admin/worklist")).toBe(false);
  });
  it("registrations list: registrar and commissioner, not treasurer", () => {
    expect(canAccessAdminPath(["commissioner"], "/admin/registrations")).toBe(true);
    expect(canAccessAdminPath(["treasurer"], "/admin/registrations")).toBe(false);
  });
  it("treasurer report: treasurer and board, not commissioner", () => {
    expect(canAccessAdminPath(["treasurer"], "/admin/treasurer")).toBe(true);
    expect(canAccessAdminPath(["board_member"], "/admin/treasurer")).toBe(true);
    expect(canAccessAdminPath(["commissioner"], "/admin/treasurer")).toBe(false);
  });
});
