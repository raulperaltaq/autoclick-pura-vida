export type AccountRole = "buyer" | "seller" | "agency" | "admin";

export function getAccountHomeRoute(
  role: AccountRole,
): "/dashboard/agencia" | "/mis-vehiculos" | "/mi-cuenta" {
  if (role === "agency") return "/dashboard/agencia";
  if (role === "admin") return "/mi-cuenta";
  return "/mis-vehiculos";
}
