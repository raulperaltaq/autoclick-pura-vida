import { describe, expect, it } from "vitest";

import {
  calculateListingEstimate,
  getPhotoLimit,
  listingPlans,
} from "@/data/monetization";

describe("listing monetization estimate", () => {
  it("uses the published price of each listing plan", () => {
    expect(calculateListingEstimate({ plan: "free", selectedTags: [], selectedPacks: [], selectedServices: [] })).toBe(0);
    expect(calculateListingEstimate({ plan: "featured", selectedTags: [], selectedPacks: [], selectedServices: [] })).toBe(2475);
    expect(calculateListingEstimate({ plan: "premium", selectedTags: [], selectedPacks: [], selectedServices: [] })).toBe(4070);
    expect(calculateListingEstimate({ plan: "premium-plus", selectedTags: [], selectedPacks: [], selectedServices: [] })).toBe(6630);
  });

  it("does not charge a tag individually when it is included in a selected pack", () => {
    const estimate = calculateListingEstimate({
      plan: "free",
      selectedTags: ["urge-vender", "negociable"],
      selectedPacks: ["quick-sale"],
      selectedServices: [],
    });

    expect(estimate).toBe(1990);
  });

  it("adds individual tags and services to the estimate", () => {
    const estimate = calculateListingEstimate({
      plan: "featured",
      selectedTags: ["llame-ya", "oferta"],
      selectedPacks: [],
      selectedServices: ["extra-photos", "boost-7-days"],
    });

    expect(estimate).toBe(2475 + 2 * 990 + 1500 + 2900);
  });
});

describe("plan photo limits", () => {
  it("sets the included photo limit for each tier", () => {
    expect(getPhotoLimit("free", false)).toBe(3);
    expect(getPhotoLimit("featured", false)).toBe(6);
    expect(getPhotoLimit("premium", false)).toBe(10);
    expect(getPhotoLimit("premium-plus", false)).toBe(10);
  });

  it("adds up to ten extra photos without exceeding twenty", () => {
    expect(getPhotoLimit("free", true)).toBe(13);
    expect(getPhotoLimit("premium", true)).toBe(20);
    expect(getPhotoLimit("premium-plus", true)).toBe(20);
  });
});

describe("free plan approval", () => {
  it("shows free listing approval and estimated wait as a plan limitation", () => {
    const freePlan = listingPlans.find((plan) => plan.id === "free");

    expect(freePlan?.features).toContain("Requiere aprobación (1–2 horas)");
  });

  it("shows a 15 percent discount label for Premium Plus", () => {
    const premiumPlus = listingPlans.find((plan) => plan.id === "premium-plus");

    expect(premiumPlus && "discountLabel" in premiumPlus ? premiumPlus.discountLabel : undefined).toBe(
      "15% de descuento",
    );
  });

  it("shows the former Premium Plus price alongside its discounted price", () => {
    const premiumPlus = listingPlans.find((plan) => plan.id === "premium-plus");

    expect(premiumPlus && "previousPrice" in premiumPlus ? premiumPlus.previousPrice : undefined).toBe(7800);
    expect(premiumPlus?.price).toBe(6630);
  });
});
