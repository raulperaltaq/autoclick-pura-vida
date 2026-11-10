import { describe, expect, it } from "vitest";
import { listings, sortListingsByPlanPriority, sortListingsByPublishDate } from "@/data/listings";
import { applyFilters, MAX_SEARCH_RESULTS } from "@/data/search-options";

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
    expect(reversedListings[0]?.id).toBe("hilux-2017");
  });

  it("orders latest listings by their publication timestamp", () => {
    expect(
      sortListingsByPublishDate(listings)
        .slice(0, 3)
        .map((listing) => listing.id),
    ).toEqual(["hilux-2017", "tucson-2020", "tucson-2023"]);
  });

  it("keeps plan priority ahead of the selected sort order", () => {
    const ordered = applyFilters([...listings].reverse(), { sort: "price" });

    expect(ordered.map((listing) => listing.plan)).toEqual([
      "premium-plus",
      "premium",
      "featured",
      "free",
      "free",
      "free",
    ]);
    expect(ordered.slice(3).map((listing) => listing.price)).toEqual([
      15900000, 16500000, 17800000,
    ]);
  });

  it("limits the visible search results to the first ten plan-ranked listings", () => {
    const multipleResults = [...listings, ...listings, ...listings];
    const ordered = applyFilters(multipleResults, {});

    expect(ordered.slice(0, MAX_SEARCH_RESULTS)).toHaveLength(10);
    expect(ordered.slice(0, MAX_SEARCH_RESULTS).map((listing) => listing.plan)).toEqual([
      "premium-plus",
      "premium-plus",
      "premium-plus",
      "premium",
      "premium",
      "premium",
      "featured",
      "featured",
      "featured",
      "free",
    ]);
  });
});
