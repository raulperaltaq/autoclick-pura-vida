import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { listings } from "@/data/listings";
import { applyFilters, parseFilters, type Filters } from "@/data/search-options";
import { ListingCard } from "@/components/listing-card";
import { VehicleSearchForm } from "@/components/vehicle-search-form";

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
  const [draft, setDraft] = useState<Filters>(search);
  useEffect(() => setDraft(search), [search]);
  const results = useMemo(() => applyFilters(listings, search), [search]);
  const submit = (filters: Filters) => {
    const clean = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value),
    ) as Filters;
    navigate({ search: clean });
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-extrabold">Vehículos en venta</h1>
      <VehicleSearchForm draft={draft} onDraftChange={setDraft} onSearch={submit} />
      <Link
        to="/autos/avanzada"
        search={draft}
        className="mt-3 inline-block rounded-full border border-border px-4 py-2 text-sm font-semibold"
      >
        Búsqueda avanzada
      </Link>
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
