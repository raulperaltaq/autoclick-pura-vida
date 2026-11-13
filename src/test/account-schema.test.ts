import { describe, expect, it } from "vitest";
import { isSchemaMismatch } from "@/lib/account-schema";

describe("account schema compatibility errors", () => {
  it("recognizes PostgREST missing-table errors from the schema cache", () => {
    expect(
      isSchemaMismatch({
        code: "PGRST205",
        message: "Could not find the table 'public.users' in the schema cache",
      }),
    ).toBe(true);
  });

  it("recognizes missing columns and relations reported by PostgreSQL", () => {
    expect(isSchemaMismatch({ code: "42703", message: 'column "agency_id" does not exist' })).toBe(
      true,
    );
    expect(isSchemaMismatch(new Error('relation "public.users" does not exist'))).toBe(true);
    expect(isSchemaMismatch('table "public.users" does not exist')).toBe(true);
  });

  it("does not treat unrelated database errors as schema mismatches", () => {
    expect(
      isSchemaMismatch({ code: "42501", message: "permission denied for table profiles" }),
    ).toBe(false);
  });
});
