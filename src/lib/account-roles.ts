export type AccountRole = "buyer" | "seller" | "agency" | "admin";

export function normalizeAccountRole(role: unknown): AccountRole | null {
  if (role === "buyer" || role === "seller" || role === "agency" || role === "admin") {
    return role;
  }
  if (role === "particular") return "seller";
  if (role === "agencia") return "agency";
  return null;
}

export function isAccountRole(role: unknown): role is AccountRole {
  return normalizeAccountRole(role) !== null;
}

export function hasAllowedRole(
  profileRole: AccountRole | null | undefined,
  allowedRoles?: readonly AccountRole[],
): boolean {
  return Boolean(profileRole && allowedRoles?.includes(profileRole));
}

export function getAccountHomeRoute(
  role: AccountRole,
): "/dashboard/agencia" | "/mis-vehiculos" | "/mi-cuenta" {
  if (role === "agency") return "/dashboard/agencia";
  if (role === "admin") return "/mi-cuenta";
  return "/mis-vehiculos";
}

export function getLoginRoleForAccess(allowedRoles?: readonly AccountRole[]): AccountRole {
  if (allowedRoles?.includes("agency")) return "agency";
  return "seller";
}
