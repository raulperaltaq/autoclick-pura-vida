import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/lib/supabase";

export function FavoriteButton({ id }: { id: string }) {
  const { user, isLoading: loading } = useAuth();
  const cache = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const favorites = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      if (!supabase) throw new Error("Los favoritos no están configurados.");
      const result = await supabase.from("favorites").select("listing_id").eq("user_id", user.id);
      if (result.error) throw new Error("No se pudieron cargar los favoritos.");
      return result.data.map((r) => r.listing_id);
    },
  });
  const saved = favorites.data?.includes(id) ?? false;
  async function toggle() {
    if (!user) return;
    if (!supabase) {
      setError("Los favoritos no están configurados.");
      return;
    }
    setBusy(true);
    setError("");
    const result = saved
      ? await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", id)
      : await supabase.from("favorites").insert({ user_id: user.id, listing_id: id });
    if (result.error) setError("No se pudo guardar el cambio.");
    else await cache.invalidateQueries({ queryKey: ["favorites", user.id] });
    setBusy(false);
  }
  return (
    <div>
      {user ? (
        <Button
          variant="outline"
          className="w-full"
          disabled={busy || favorites.isPending || favorites.isError}
          onClick={() => void toggle()}
        >
          <Heart className={saved ? "fill-current" : ""} />
          {saved ? "Quitar de favoritos" : "Guardar favorito"}
        </Button>
      ) : (
        <Button variant="outline" className="w-full" disabled={loading} asChild>
          <Link to="/acceder" search={{ mode: "login", role: "seller", redirect: `/autos/${id}` }}>
            <Heart />
            Acceder para guardar favorito
          </Link>
        </Button>
      )}
      {(error || favorites.isError) && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error || "No se pudieron cargar los favoritos."}
        </p>
      )}
    </div>
  );
}
