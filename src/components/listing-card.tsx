import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { formatCRC, type Listing } from "@/data/listings";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      to="/autos/$id"
      params={{ id: listing.id }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:shadow-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={listing.image} alt={`${listing.make} ${listing.model} ${listing.year}`} loading="lazy" width={1024} height={768} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {listing.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">Destacado</span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold leading-tight">
            {listing.make} {listing.model}
          </h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {listing.year} · {listing.km.toLocaleString("es-CR")} km · {listing.transmission}
        </p>
        <div className="mt-3">
          <p className="font-display text-xl font-extrabold">{formatCRC(listing.price)}</p>
        </div>
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {listing.province}
        </p>
      </div>
    </Link>
  );
}
