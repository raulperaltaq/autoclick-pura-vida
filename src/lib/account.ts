export function accountHome(roles: readonly string[]) {
  return roles.includes("agency") ? "/dashboard/agencia" : "/mis-vehiculos";
}

export function safeReturnPath(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return undefined;
  return value;
}

export function buildPasswordResetUrl(baseOrigin: string): string {
  return new URL("/reset-password", baseOrigin).toString();
}

export function isPasswordRecoveryFlow(
  hash: string | URLSearchParams,
  storage?: Pick<Storage, "getItem"> | null,
): boolean {
  const params = typeof hash === "string" ? new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash) : hash;
  const hasRecoveryType = params.get("type") === "recovery";
  const hasRecoveryToken = params.has("access_token") || params.has("refresh_token");
  const hasStoredRecovery = storage?.getItem("password-recovery") === "true";
  return hasRecoveryType || hasRecoveryToken || hasStoredRecovery;
}

export function accountHead(title: string, description: string) {
  return { meta: [{ title: `${title} | autoclick.cr` }, { name: "description", content: description }, { property: "og:title", content: `${title} | autoclick.cr` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
}