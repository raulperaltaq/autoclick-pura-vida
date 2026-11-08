import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { provinces } from "@/data/listings";
import { brands, parseFilters, styles, type Filters } from "@/data/search-options";

export const Route = createFileRoute("/autos/avanzada")({
  validateSearch: parseFilters,
  head: () => ({
    meta: [
      { title: "Búsqueda avanzada de vehículos | autoclick.cr" },
      { name: "description", content: "Buscá vehículos en Costa Rica por marca, modelo, estilo, combustible, transmisión, provincia y más." },
      { property: "og:title", content: "Búsqueda avanzada | autoclick.cr" },
      { property: "og:description", content: "Encontrá el vehículo exacto con filtros detallados." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdvancedPage,
});

type Opt = [string, string];
const any = (label = "No Importa"): Opt => ["", label];
const list = (xs: string[]): Opt[] => xs.map((x) => [x, x]);

function AdvancedPage() {
  const initial = Route.useSearch();
  const navigate = useNavigate();
  const [f, setF] = useState<Filters>({ condition: "Usado", sort: "price", ...initial });
  const set = (k: keyof Filters) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));
  const input = "w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

  const sel = (k: keyof Filters, label: string, opts: Opt[]) => (
    <Field label={label}>
      <select className={input} value={f[k] ?? ""} onChange={set(k)}>
        {opts.map(([v, t]) => <option key={t} value={v}>{t}</option>)}
      </select>
    </Field>
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = Object.fromEntries(Object.entries(f).filter(([, v]) => v)) as Filters;
    navigate({ to: "/autos", search: clean });
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-extrabold">Búsqueda avanzada</h1>
      <form onSubmit={submit} className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        {sel("make", "Marca", [any(), ...list(brands)])}
        <Field label="Modelo"><input className={input} value={f.model ?? ""} onChange={set("model")} placeholder="Cualquiera" /></Field>
        {sel("style", "Estilo", [any(), ...list(styles)])}
        {sel("fuel", "Combustible", [any("No importa"), ["Gasolina", "Gasolina"], ["Diésel", "Diesel"], ["Híbrido", "Híbrido"], ["Eléctrico", "Eléctrico"]])}
        {sel("transmission", "Transmisión", [any(), ...list(["Manual", "Automática"])])}
        {sel("financing", "Financiado", [any("No importa"), ["si", "Sólo con financiam."]])}
        {sel("trade", "Se recibe", [any("No importa"), ["si", "Sólo si recibe"]])}
        {sel("province", "Provincia", [any(), ...list([...provinces].sort((a, b) => a.localeCompare(b)))])}
        {sel("doors", "# puertas", [any(), ["2-3", "2-3"], ["4+", "4 o más"]])}
        <Field label="Año (desde)">
          <input className={input} type="number" min={1950} max={new Date().getFullYear() + 1} value={f.year ?? ""} onChange={set("year")} placeholder="Cualquiera (1950 en adelante)" />
        </Field>
        {sel("sort", "Ordenar por", [["price", "Precio"], ["year", "Año"], ["make", "Marca"], ["model", "Modelo"]])}
        {sel("condition", "Mostrar", [["Usado", "Solo usados"], ["", "Nuevos y usados"]])}
        <button className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground sm:col-span-2">Buscar</button>
      </form>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}
