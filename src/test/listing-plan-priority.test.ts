import { describe, expect, it } from "vitest";
import { listings, sortListingsByPlanPriority } from "@/data/listings";

describe("listing plan priority", () => {
  it("orders Premium Plus, Premium, Destacado, and free listings", () => {
    const reversedListings = [...listings].reverse();
    const ordered = sortListingsByPlanPriority(reversedListings);

    expect(ordered.map((listing) => listing.plan)).toEqual([
      "premium-plus",
      "premium",
      "featured",
      "free",
      "free",
      "free",
    ]);
    expect(ordered.map((listing) => listing.id)).toEqual([
      "rav4-2022",
      "hilux-2021",
      "tucson-2023",
      "hilux-2017",
      "rav4-2019",
      "tucson-2020",
    ]);
    expect(reversedListings[0].id).toBe("hilux-2017");
  });
});
