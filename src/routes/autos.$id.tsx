import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BadgeCheck, MapPin, MessageCircle, Phone } from "lucide-react";
import { formatCRC, listings } from "@/data/listings";
import { PriceBadge } from "@/components/listing-card";

export const Route = createFileRoute("/autos/$id")({
  loader: ({ params }) => {
    const listing = listings.find((l) => l.id === params.id);
    if (!listing) throw notFound();
    return { listing };
  },
  head: ({ loaderData }) => {
    const l = loaderData?.listing;
    const title = l ? `${l.make} ${l.model} ${l.year} en ${l.province} | autoclick.cr` : "Anuncio no disponible | autoclick.cr";
    const desc = l ? `${formatCRC(l.price)} · ${l.km.toLocaleString("es-CR")} km · ${l.fuel}. ${l.description}` : "Este anuncio no está disponible.";
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title }, { property: "og:description", content: desc }] };
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-6xl px-4 py-24 text-center">
      <h1 className="text-3xl font-extrabold">Anuncio no encontrado</h1>
      <Link to="/autos" search={{ q: "" }} className="mt-4 inline-block font-semibold text-primary">Ver vehículos</Link>
    </main>
  ),
  component: Detail,
});

function Detail() {
  const { listing: l } = Route.useLoaderData();
  const specs = [
    ["Año", l.year],
    ["Kilometraje", `${l.km.toLocaleString("es-CR")} km`],
    ["Combustible", l.fuel],
    ["Transmisión", l.transmission],
    ["Carrocería", l.body],
    ["Provincia", l.province],
  ];
  const msg = encodeURIComponent(`Hola, vi su ${l.make} ${l.model} ${l.year} en autoclick.cr. ¿Sigue disponible?`);
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/autos" search={{ q: "" }} className="text-sm font-semibold text-muted-foreground hover:text-foreground">← Volver a resultados</Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <img src={l.image} alt={`${l.make} ${l.model}`} width={1024} height={768} className="w-full rounded-3xl object-cover" />
          <h2 className="mt-8 text-2xl font-bold">Descripción</h2>
          <p className="mt-2 text-muted-foreground">{l.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {specs.map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-muted p-4">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h1 className="text-3xl font-extrabold leading-tight">{l.make} {l.model}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {l.province}</p>
            <p className="mt-4 font-display text-4xl font-extrabold">{formatCRC(l.price)}</p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <PriceBadge listing={l} />
              <span className="text-muted-foreground">Mercado: {formatCRC(l.marketPrice)}</span>
            </div>
            <div className="mt-6 grid gap-2">
              <a href={`https://wa.me/${l.phone}?text=${msg}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground hover:bg-primary/90">
                <MessageCircle className="h-5 w-5" /> WhatsApp
              </a>
              <a href={`tel:+${l.phone}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 font-bold hover:bg-muted">
                <Phone className="h-5 w-5" /> Llamar
              </a>
            </div>
          </div>
          <div className="rounded-3xl bg-secondary p-6">
            <p className="font-bold">{l.seller}</p>
            {l.verified ? (
              <p className="mt-1 flex items-center gap-1 text-sm text-primary"><BadgeCheck className="h-4 w-4" /> Vendedor verificado</p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">Vendedor sin verificar — nunca adelantés dinero.</p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
