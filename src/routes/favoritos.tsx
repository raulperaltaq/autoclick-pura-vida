import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ListingCard } from "@/components/listing-card";
import { AuthOnly } from "@/components/auth-only";
import { listings } from "@/data/listings";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/lib/supabase";
import type { Listing } from "@/data/listings";

export const Route = createFileRoute("/favoritos")({
  head: () => ({ meta: [{ title: "Favoritos | autoclick.cr" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  return (
    <AuthOnly>
      <FavoritesList />
    </AuthOnly>
  );
}

function FavoritesList() {
  const { user, isLoading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (authLoading || !user || !supabase) return;
    let active = true;
    setIsLoading(true);
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("listing_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        const favoriteListings = (data ?? [])
          .map(({ listing_id }) => listings.find((listing) => listing.id === listing_id))
          .filter((listing): listing is Listing => listing !== undefined);
        if (active) {
          setFavorites(favoriteListings);
          setErrorMessage("");
        }
      } catch (error) {
        if (!active) return;
        console.error("Could not load saved vehicles:", error);
        setErrorMessage("No se pudieron cargar tus favoritos. Intentá nuevamente.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <h1 className="text-4xl font-extrabold">Favoritos</h1>
      {isLoading ? (
        <p role="status" className="mt-6 text-muted-foreground">Cargando favoritos…</p>
      ) : errorMessage ? (
        <p role="alert" className="mt-6 rounded-xl bg-muted p-4 text-sm">{errorMessage}</p>
      ) : favorites.length ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-muted p-8 text-center">
          <p className="text-muted-foreground">Todavía no guardaste vehículos.</p>
          <Link to="/autos" search={{ q: "" }} className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground">
            Explorar vehículos
          </Link>
        </div>
      )}
    </main>
  );
}
