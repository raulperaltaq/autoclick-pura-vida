import { describe, expect, it } from "vitest";

import { getAccountHomeRoute } from "@/lib/account-roles";

describe("role-based account routing", () => {
  it("sends agency accounts to the agency dashboard", () => {
    expect(getAccountHomeRoute("agency")).toBe("/dashboard/agencia");
  });

  it.each(["buyer", "seller", "admin"] as const)(
    "sends %s accounts to the personal account",
    (role) => {
      expect(getAccountHomeRoute(role)).toBe("/mi-cuenta");
    },
  );
});
