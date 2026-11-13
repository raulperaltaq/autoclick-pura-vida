import { describe, expect, it } from "vitest";
import { getFavoriteLoginRedirect } from "@/lib/favorites";

describe("favorite sign-in redirect", () => {
  it("returns to the listing with a save intent after sign-in", () => {
    expect(getFavoriteLoginRedirect("vehicle-123")).toBe("/autos/vehicle-123?saveFavorite=1");
  });

  it("preserves the originating page for the listing back link", () => {
    expect(getFavoriteLoginRedirect("vehicle-123", "/autos?q=Toyota+Camry")).toBe(
      "/autos/vehicle-123?saveFavorite=1&returnTo=%2Fautos%3Fq%3DToyota%2BCamry",
    );
  });

  it("encodes listing IDs as a single path segment", () => {
    expect(getFavoriteLoginRedirect("vehicle/123")).toBe("/autos/vehicle%2F123?saveFavorite=1");
  });
});
