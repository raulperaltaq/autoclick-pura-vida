import { describe, expect, it } from "vitest";
import { buildPasswordResetUrl, isPasswordRecoveryFlow } from "@/lib/account";

describe("password recovery helpers", () => {
  it("builds the reset-password URL from the app origin", () => {
    expect(buildPasswordResetUrl("https://example.com")).toBe("https://example.com/reset-password");
  });

  it("recognizes recovery flows from a hash or stored session flag", () => {
    expect(isPasswordRecoveryFlow("#type=recovery&access_token=test-token")).toBe(true);
    expect(isPasswordRecoveryFlow("access_token=test-token")).toBe(true);
    expect(isPasswordRecoveryFlow("", { getItem: () => "true" })).toBe(true);
    expect(isPasswordRecoveryFlow("#type=magiclink")).toBe(false);
  });
});
