import { Link, useNavigate } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/use-auth";

export function ListingFavoriteButton({ listingId }: { listingId: string }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (isAuthLoading || !user || !supabase) return;
    let active = true;
    setIsLoading(true);
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("listing_id")
          .eq("user_id", user.id)
          .eq("listing_id", listingId)
          .maybeSingle();
        if (error) throw error;
        if (active) setIsSaved(Boolean(data));
      } catch (error) {
        if (!active) return;
        console.error("Could not load vehicle favorite:", error);
        setStatus("No se pudo cargar el favorito.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthLoading, listingId, user]);

  const toggleFavorite = async () => {
    if (isAuthLoading || isLoading) return;
    if (!user) {
      await navigate({
        to: "/acceder",
        search: { mode: "login", role: "seller" },
      });
      return;
    }
    if (!supabase) {
      setStatus("Los favoritos no están disponibles en este momento.");
      return;
    }

    setIsLoading(true);
    setStatus("");
    try {
      if (isSaved) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listingId);
        if (error) throw error;
        setIsSaved(false);
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, listing_id: listingId });
        if (error) throw error;
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Could not update vehicle favorite:", error);
      setStatus("No se pudo actualizar el favorito. Intentá nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute right-3 top-3 z-10">
      {user ? (
        <button
          type="button"
          disabled={isLoading || isAuthLoading}
          onClick={() => void toggleFavorite()}
          aria-label={isSaved ? "Quitar de favoritos" : "Guardar en favoritos"}
          aria-pressed={isSaved}
          title={isSaved ? "Quitar de favoritos" : "Guardar en favoritos"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/95 text-foreground shadow-sm transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Heart className={`h-5 w-5 ${isSaved ? "fill-current text-primary" : ""}`} />
        </button>
      ) : (
        <Link
          to="/acceder"
          search={{ mode: "login", role: "seller" }}
          aria-label="Iniciar sesión para guardar en favoritos"
          title="Iniciar sesión para guardar en favoritos"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/95 text-foreground shadow-sm transition hover:bg-background"
        >
          <Heart className="h-5 w-5" />
        </Link>
      )}
      {status && (
        <p
          role="status"
          className="absolute right-0 top-full mt-2 w-52 rounded-lg bg-card p-2 text-right text-xs text-destructive shadow"
        >
          {status}
        </p>
      )}
    </div>
  );
}
