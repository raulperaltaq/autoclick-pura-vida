import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { listings, provinces } from "@/data/listings";
import { ListingCard } from "@/components/listing-card";

export const Route = createFileRoute("/autos/")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s['q'] === "string" ? s['q'] : "" }),
  head: () => ({
    meta: [
      { title: "Vehículos en venta en Costa Rica | autoclick.cr" },
      { name: "description", content: "Explorá carros, SUVs y pickups usados en venta en todo Costa Rica con filtros por precio, provincia y más." },
      { property: "og:title", content: "Vehículos en venta | autoclick.cr" },
      { property: "og:description", content: "Carros, SUVs y pickups en venta en Costa Rica." },
    ],
  }),
  component: AutosPage,
});

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function AutosPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/autos/" });
  const [province, setProvince] = useState("");
  const [body, setBody] = useState("");
  const [max, setMax] = useState(0);
  const [sort, setSort] = useState("recent");

  const results = useMemo(() => {
    const words = norm(q).split(/\s+/).filter((w) => w.length > 1 && !["en", "de", "con", "un", "una"].includes(w));
    let r = listings.filter((l) => {
      const hay = norm(`${l.make} ${l.model} ${l.year} ${l.fuel} ${l.body} ${l.province} ${l.transmission}`);
      return words.every((w) => hay.includes(w));
    });
    if (province) r = r.filter((l) => l.province === province);
    if (body) r = r.filter((l) => l.body === body);
    if (max) r = r.filter((l) => l.price <= max);
    if (sort === "low") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "high") r = [...r].sort((a, b) => b.price - a.price);
    return [...r].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [q, province, body, max, sort]);

  const select = "rounded-full border border-input bg-card px-4 py-2 text-sm font-medium";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-extrabold">Vehículos en venta</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => navigate({ search: { q: e.target.value }, replace: true })}
          placeholder="Marca, modelo o frase…"
          className="min-w-56 flex-1 rounded-full border border-input bg-card px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <select className={select} value={province} onChange={(e) => setProvince(e.target.value)}>
          <option value="">Toda Costa Rica</option>
          {provinces.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select className={select} value={body} onChange={(e) => setBody(e.target.value)}>
          <option value="">Todo tipo</option>
          {["SUV", "Pickup", "Sedán", "Hatchback"].map((b) => <option key={b}>{b}</option>)}
        </select>
        <select className={select} value={max} onChange={(e) => setMax(Number(e.target.value))}>
          <option value={0}>Cualquier precio</option>
          <option value={15000000}>Hasta ₡15M</option>
          <option value={20000000}>Hasta ₡20M</option>
          <option value={25000000}>Hasta ₡25M</option>
        </select>
        <select className={select} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="recent">Más recientes</option>
          <option value="low">Menor precio</option>
          <option value="high">Mayor precio</option>
        </select>
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
