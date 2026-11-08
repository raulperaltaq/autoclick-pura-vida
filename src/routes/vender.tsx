import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { provinces } from "@/data/listings";

export const Route = createFileRoute("/vender")({
  head: () => ({
    meta: [
      { title: "Vendé tu carro en Costa Rica | autoclick.cr" },
      { name: "description", content: "Publicá tu vehículo gratis en menos de 2 minutos y recibí contactos por WhatsApp." },
      { property: "og:title", content: "Vendé tu carro | autoclick.cr" },
      { property: "og:description", content: "Publicá gratis en menos de 2 minutos." },
    ],
  }),
  component: Vender,
});

const field = "w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring";

function Vender() {
  const [sent, setSent] = useState(false);
  if (sent)
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
        <h1 className="mt-4 text-3xl font-extrabold">¡Anuncio enviado!</h1>
        <p className="mt-2 text-muted-foreground">Lo revisaremos y te avisaremos cuando esté publicado.</p>
        <Link to="/autos" search={{ q: "" }} className="mt-6 inline-block font-semibold text-primary">Ver vehículos</Link>
      </main>
    );
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-extrabold">Vendé tu vehículo</h1>
      <p className="mt-2 text-muted-foreground">Gratis, en menos de 2 minutos.</p>
      <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-8 grid gap-4 sm:grid-cols-2">
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
        <input required type="tel" placeholder="WhatsApp (8 dígitos)" className={`${field} sm:col-span-2`} />
        <textarea rows={4} placeholder="Contá el estado, mantenimientos, extras…" className={`${field} sm:col-span-2`} />
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-sm text-muted-foreground sm:col-span-2">
          Subí hasta 20 fotos
          <input type="file" accept="image/*" multiple className="sr-only" />
        </label>
        <button className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90 sm:col-span-2">Publicar anuncio</button>
      </form>
    </main>
  );
}
