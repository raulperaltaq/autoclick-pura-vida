import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { listings } from "@/data/listings";
import { applyFilters, brands, parseFilters } from "@/data/search-options";
import { ListingCard } from "@/components/listing-card";

export const Route = createFileRoute("/autos/")({
  validateSearch: parseFilters,
  head: () => ({
    meta: [
      { title: "Vehículos en venta en Costa Rica | autoclick.cr" },
      { name: "description", content: "Explorá carros, SUVs y pickups en venta en todo Costa Rica con filtros por marca, año y condición." },
      { property: "og:title", content: "Vehículos en venta | autoclick.cr" },
      { property: "og:description", content: "Carros, SUVs y pickups en venta en Costa Rica." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AutosPage,
});

function AutosPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/autos/" });
  const set = (k: string, v: string) => navigate({ search: (p) => ({ ...p, [k]: v || undefined }), replace: true });
  const results = useMemo(() => applyFilters(listings, search), [search]);
  const field = "rounded-full border border-input bg-card px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-ring";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-extrabold">Vehículos en venta</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <input value={search.q ?? ""} onChange={(e) => set("q", e.target.value)} placeholder="Marca, modelo o frase…" className={`min-w-56 flex-1 ${field}`} />
        <select aria-label="Marca" className={field} value={search.make ?? ""} onChange={(e) => set("make", e.target.value)}>
          <option value="">Marca</option>
          {brands.map((b) => <option key={b}>{b}</option>)}
        </select>
        <input aria-label="Año desde" type="number" min={1950} max={new Date().getFullYear() + 1} placeholder="Año (desde 1950)" value={search.year ?? ""} onChange={(e) => set("year", e.target.value)} className={`w-44 ${field}`} />
        <select aria-label="Condición" className={field} value={search.condition ?? ""} onChange={(e) => set("condition", e.target.value)}>
          <option value="">Condición</option>
          <option>Nuevo</option>
          <option>Usado</option>
        </select>
        <Link to="/autos/avanzada" search={search} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Búsqueda avanzada</Link>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{results.length} resultados</p>
      {results.length ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl bg-muted p-10 text-center text-muted-foreground">No encontramos vehículos con esos filtros.</div>
      )}
    </main>
  );
}
