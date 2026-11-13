export function getFavoriteLoginRedirect(listingId: string, returnTo?: string): string {
  const search = new URLSearchParams({ saveFavorite: "1" });
  if (returnTo) search.set("returnTo", returnTo);
  return `/autos/${encodeURIComponent(listingId)}?${search.toString()}`;
}
