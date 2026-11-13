import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Car, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchOwnedListings } from "@/data/listings-repository";
import { formatListingPrice } from "@/data/listings";
import { AuthOnly } from "@/components/auth-only";
import { getOwnedListingStatus } from "@/data/owned-listing-status";
import { accountHead } from "@/lib/account";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/_authenticated/mis-vehiculos")({
  head: () => accountHead("Mis vehículos", "Tu cuenta particular y tus anuncios en autoclick.cr."),
  component: MyVehicles,
});

function MyVehicles() {
  return (
    <AuthOnly allowedRoles={["buyer", "seller", "admin"]}>
      <MyVehiclesList />
    </AuthOnly>
  );
}

function MyVehiclesList() {
  const { user } = useAuth();
  const listingsQuery = useQuery({
    queryKey: ["owned-listings", user?.id],
    queryFn: () => {
      if (!user) throw new Error("Iniciá sesión para consultar tus vehículos.");
      return fetchOwnedListings(user.id);
    },
    enabled: Boolean(user),
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <p className="text-sm font-semibold text-primary">Mi cuenta · Particular</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">Mis vehículos</h1>
        <Button asChild>
          <Link to="/vender">
            <Plus />
            Publicar vehículo
          </Link>
        </Button>
      </div>

      {listingsQuery.isPending ? (
        <p role="status" className="py-20 text-center text-muted-foreground">
          Cargando tus vehículos…
        </p>
      ) : listingsQuery.isError ? (
        <div role="alert" className="mt-8 rounded-xl border border-destructive/30 bg-muted p-5">
          <p className="font-semibold">No se pudieron cargar tus vehículos.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {listingsQuery.error instanceof Error
              ? listingsQuery.error.message
              : "Intentá nuevamente."}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => void listingsQuery.refetch()}
          >
            Reintentar
          </Button>
        </div>
      ) : listingsQuery.data.length === 0 ? (
        <div className="py-20 text-center">
          <Car className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-bold">Todavía no tenés anuncios</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Cuando publiques un vehículo, podrás consultar aquí su estado.
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4">
          {listingsQuery.data.map((listing) => {
            const status = getOwnedListingStatus(listing.status);
            return (
              <li
                key={listing.id}
                className="grid gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-[9rem_1fr_auto] sm:items-center"
              >
                {listing.image ? (
                  <img
                    src={listing.image}
                    alt={`${listing.make} ${listing.model}`}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-xl object-cover sm:w-36"
                  />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-muted sm:w-36">
                    <Car className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold">
                    {listing.make} {listing.model} {listing.year}
                  </h2>
                  <p className="mt-1 font-semibold">{formatListingPrice(listing)}</p>
                  {listing.publishedAt && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Publicado el{" "}
                      {new Intl.DateTimeFormat("es-CR", { dateStyle: "medium" }).format(
                        new Date(listing.publishedAt),
                      )}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
                    {status.label}
                  </span>
                  {listing.status === "published" && (
                    <Button asChild size="sm" variant="outline">
                      <Link
                        to="/autos/$id"
                        params={{ id: listing.id }}
                        search={{ returnTo: "/mis-vehiculos" }}
                      >
                        Ver anuncio
                      </Link>
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
