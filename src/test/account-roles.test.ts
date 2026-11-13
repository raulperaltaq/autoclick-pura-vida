import { describe, expect, it } from "vitest";

import { getAccountHomeRoute } from "@/lib/account-roles";

describe("role-based account routing", () => {
  it("sends agency accounts to the agency dashboard", () => {
    expect(getAccountHomeRoute("agency")).toBe("/dashboard/agencia");
  });

  it.each(["buyer", "seller"] as const)("sends %s accounts to their vehicles", (role) => {
    expect(getAccountHomeRoute(role)).toBe("/mis-vehiculos");
  });

  it("keeps admin accounts on the account page until an admin dashboard exists", () => {
    expect(getAccountHomeRoute("admin")).toBe("/mi-cuenta");
  });
});
