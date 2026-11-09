import type { Dispatch, FormEvent, SetStateAction } from "react";
import { brands, type Filters } from "@/data/search-options";

type VehicleSearchFormProps = {
  draft: Filters;
  onDraftChange: Dispatch<SetStateAction<Filters>>;
  onSearch: (filters: Filters) => void;
};

const field = "rounded-full border border-input bg-card px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-ring";

export function VehicleSearchForm({ draft, onDraftChange, onSearch }: VehicleSearchFormProps) {
  const set = (key: keyof Filters, value: string) => {
    onDraftChange((current) => ({ ...current, [key]: value || undefined }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(draft);
  };

  return (
    <form onSubmit={submit} className="mt-6 flex flex-wrap gap-2">
      <input
        aria-label="Marca, modelo o frase"
        value={draft.q ?? ""}
        onChange={(event) => set("q", event.target.value)}
        placeholder="Marca, modelo o frase…"
        className={`min-w-56 flex-1 ${field}`}
      />
      <select aria-label="Marca" className={field} value={draft.make ?? ""} onChange={(event) => set("make", event.target.value)}>
        <option value="">Marca</option>
        {brands.map((brand) => <option key={brand}>{brand}</option>)}
      </select>
      <input
        aria-label="Año desde"
        type="number"
        min={1950}
        max={new Date().getFullYear() + 1}
        placeholder="Año"
        value={draft.year ?? ""}
        onChange={(event) => set("year", event.target.value)}
        className={`w-44 ${field}`}
      />
      <select aria-label="Condición" className={field} value={draft.condition ?? ""} onChange={(event) => set("condition", event.target.value)}>
        <option value="">Condición</option>
        <option>Nuevo</option>
        <option>Usado</option>
      </select>
      <button type="submit" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
        Buscar
      </button>
    </form>
  );
}
