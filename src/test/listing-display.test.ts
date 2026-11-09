import { describe, expect, it } from "vitest";
import { getListingOptionalDetails, getListingSellerFirstName } from "@/data/listings";

describe("listing display data", () => {
  it("shows only completed, supported optional fields", () => {
    expect(
      getListingOptionalDetails({
        exterior_color: "  Blanco ",
        extras: ["Aire acondicionado", "Apple CarPlay"],
        maintenance_history: "",
        seller_email: "private@example.com",
        phone_2: "88887777",
      }),
    ).toEqual([
      { label: "Color exterior", value: "Blanco" },
      { label: "Equipamiento", value: "Aire acondicionado, Apple CarPlay" },
    ]);
  });

  it("does not display surnames", () => {
    expect(getListingSellerFirstName("María Rodríguez")).toBe("María");
    expect(getListingSellerFirstName("")).toBe("");
  });
});
