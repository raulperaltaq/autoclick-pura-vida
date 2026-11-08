import { createFileRoute } from "@tanstack/react-router";
import { provinces } from "@/data/listings";

export const Route = createFileRoute("/vender")({
  head: () => ({
    meta: [
      { title: "Vendé tu carro en Costa Rica | autoclick.cr" },
      { name: "description", content: "Publicá tu vehículo y contactá directamente con compradores en Costa Rica." },
      { property: "og:title", content: "Vendé tu carro | autoclick.cr" },
      { property: "og:description", content: "Publicá gratis en menos de 2 minutos." },
    ],
  }),
  component: Vender,
});

const field = "w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring";

function Vender() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-extrabold">Vendé tu vehículo</h1>
      <p className="mt-2 text-muted-foreground">Publicá gratis y contactá directamente con compradores.</p>
      <p role="status" className="mt-4 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
        La publicación estará disponible cuando se active el almacenamiento compartido. Los anuncios se publicarán sin revisión de la plataforma.
      </p>
      <form onSubmit={(e) => e.preventDefault()} className="mt-8 grid gap-4 sm:grid-cols-2">
        <input required placeholder="Marca (ej. Toyota)" className={field} />
        <input required placeholder="Modelo (ej. RAV4)" className={field} />
        <input required type="number" min={1980} max={2027} placeholder="Año" className={field} />
        <input required type="number" min={0} placeholder="Kilometraje" className={field} />
        <input required type="number" min={0} placeholder="Precio en colones" className={field} />
        <select required className={field} defaultValue="">
          <option value="" disabled>Provincia</option>
          {provinces.map((p) => <option key={p}>{p}</option>)}
        </select>
        <input placeholder="VIN (opcional, da más confianza)" className={`${field} sm:col-span-2`} />
        <input required type="tel" placeholder="Teléfono de contacto (8 dígitos)" className={`${field} sm:col-span-2`} />
        <textarea rows={4} placeholder="Contá el estado, mantenimientos, extras…" className={`${field} sm:col-span-2`} />
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-sm text-muted-foreground sm:col-span-2">
          Subí hasta 20 fotos
          <input type="file" accept="image/*" multiple className="sr-only" />
        </label>
        <button disabled className="cursor-not-allowed rounded-full bg-muted px-6 py-3 font-bold text-muted-foreground sm:col-span-2">Publicar anuncio (próximamente)</button>
      </form>
    </main>
  );
}
