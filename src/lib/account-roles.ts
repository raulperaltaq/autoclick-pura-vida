export type AccountRole = "buyer" | "seller" | "agency" | "admin";

export function getAccountHomeRoute(role: AccountRole): "/dashboard/agencia" | "/mi-cuenta" {
  return role === "agency" ? "/dashboard/agencia" : "/mi-cuenta";
}
