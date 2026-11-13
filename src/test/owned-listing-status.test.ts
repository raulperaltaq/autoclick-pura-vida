import { describe, expect, it } from "vitest";
import { getOwnedListingStatus } from "@/data/owned-listing-status";

describe("owned listing status display", () => {
  it.each([
    ["pending_review", "En revisión"],
    ["published", "Publicado"],
    ["paused", "Pausado"],
    ["sold", "Vendido"],
    ["rejected", "Rechazado"],
  ])("labels %s as %s", (status, label) => {
    expect(getOwnedListingStatus(status).label).toBe(label);
  });

  it("humanizes statuses not yet known by the UI", () => {
    expect(getOwnedListingStatus("expired_pending").label).toBe("expired pending");
  });
});
