import { describe, expect, it } from "vitest";

import { getAccountHomeRoute, hasAllowedRole, normalizeAccountRole } from "@/lib/account-roles";

describe("role-based account routing", () => {
  it("normalizes the Spanish role aliases used by the app redirects", () => {
    expect(normalizeAccountRole("agencia")).toBe("agency");
    expect(normalizeAccountRole("particular")).toBe("seller");
    expect(normalizeAccountRole("buyer")).toBe("buyer");
  });

  it("sends agency accounts to the agency dashboard", () => {
    expect(getAccountHomeRoute("agency")).toBe("/dashboard/agencia");
  });

  it.each(["buyer", "seller"] as const)("sends %s accounts to their vehicles", (role) => {
    expect(getAccountHomeRoute(role)).toBe("/mis-vehiculos");
  });

  it("keeps admin accounts on the account page until an admin dashboard exists", () => {
    expect(getAccountHomeRoute("admin")).toBe("/mi-cuenta");
  });

  it("enforces access rules against the active account role", () => {
    expect(hasAllowedRole("agency", ["agency", "admin"])).toBe(true);
    expect(hasAllowedRole("seller", ["agency", "admin"])).toBe(false);
    expect(hasAllowedRole(null, ["seller"])).toBe(false);
  });
});
