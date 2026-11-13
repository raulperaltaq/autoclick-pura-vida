const listingStatuses: Record<string, { label: string; className: string }> = {
  pending_review: { label: "En revisión", className: "bg-yellow-100 text-yellow-900" },
  published: { label: "Publicado", className: "bg-green-100 text-green-900" },
  paused: { label: "Pausado", className: "bg-muted text-muted-foreground" },
  sold: { label: "Vendido", className: "bg-blue-100 text-blue-900" },
  rejected: { label: "Rechazado", className: "bg-destructive/10 text-destructive" },
};

export function getOwnedListingStatus(status: string) {
  return (
    listingStatuses[status] ?? {
      label: status.replaceAll("_", " "),
      className: "bg-muted text-muted-foreground",
    }
  );
}
