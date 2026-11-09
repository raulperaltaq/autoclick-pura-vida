export function accountHome(roles: readonly string[]) {
  return roles.includes("agency") ? "/dashboard/agencia" : "/mis-vehiculos";
}

export function safeReturnPath(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return undefined;
  return value;
}

export function accountHead(title: string, description: string) {
  return { meta: [{ title: `${title} | autoclick.cr` }, { name: "description", content: description }, { property: "og:title", content: `${title} | autoclick.cr` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
}