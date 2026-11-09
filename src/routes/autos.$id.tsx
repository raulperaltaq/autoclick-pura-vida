import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";
import {
  formatListingPrice,
  getListingOptionalDetails,
  getListingSellerFirstName,
} from "@/data/listings";
import { fetchListings } from "@/data/listings-repository";
import { ListingFavoriteButton } from "@/components/listing-favorite-button";

export const Route = createFileRoute("/autos/$id")({
  loader: async ({ params }) => {
    const allListings = await fetchListings();
    const listing = allListings.find((l) => l.id === params.id);
    if (!listing) throw notFound();
    return { listing };
  },
  head: ({ loaderData }) => {
    const l = loaderData?.listing;
    const title = l
      ? `${l.make} ${l.model} ${l.year} en ${l.province} | autoclick.cr`
      : "Anuncio no disponible | autoclick.cr";
    const desc = l
      ? `${formatListingPrice(l)}${l.km !== null ? ` · ${l.km.toLocaleString("es-CR")} km` : ""} · ${l.fuel}${l.description ? `. ${l.description}` : ""}`
      : "Este anuncio no está disponible.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-6xl px-4 py-24 text-center">
      <h1 className="text-3xl font-extrabold">Anuncio no encontrado</h1>
      <Link to="/autos" search={{ q: "" }} className="mt-4 inline-block font-semibold text-primary">
        Ver vehículos
      </Link>
    </main>
  ),
  component: Detail,
});

function Detail() {
  const { listing: l } = Route.useLoaderData();
  const [shareStatus, setShareStatus] = useState("");
  const specs: Array<[string, string | number | null]> = [
    ["Año", l.year],
    ["Kilometraje", l.km === null ? null : `${l.km.toLocaleString("es-CR")} km`],
    ["Combustible", l.fuel],
    ["Transmisión", l.transmission],
    ["Estilo", l.style],
    ["Estado", l.condition],
    ["Provincia", l.province],
    ["Puertas", l.doors],
    ["Financiamiento", l.financing === null ? null : l.financing ? "Sí" : "No"],
    ["Recibe vehículo", l.trade === null ? null : l.trade ? "Sí" : "No"],
  ];
  const optionalDetails = getListingOptionalDetails(l.details);
  const phone = l.phone.replace(/\D/g, "");
  const whatsappNumber = phone.startsWith("506") ? phone : `506${phone}`;
  const contactPhone = phone.startsWith("506") ? phone.slice(3) : phone;
  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa el ${l.make} ${l.model} ${l.year} publicado en autoclick.cr.`,
  );

  const shareListing = async () => {
    setShareStatus("");
    const shareData = {
      title: `${l.make} ${l.model} ${l.year} | autoclick.cr`,
      text: `Mirá este vehículo: ${l.make} ${l.model} ${l.year} por ${formatListingPrice(l)}.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        setShareStatus("Enlace copiado.");
      } else {
        setShareStatus("Tu navegador no permite compartir ni copiar el enlace.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Could not share vehicle listing:", error);
      setShareStatus("No se pudo compartir el anuncio. Intentá nuevamente.");
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/autos"
        search={{ q: "" }}
        className="text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        ← Volver a resultados
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {l.images.map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={image}
                alt={`${l.make} ${l.model}, foto ${index + 1}`}
                width={1024}
                height={768}
                className={`w-full rounded-3xl object-cover ${index === 0 ? "sm:col-span-2" : ""}`}
              />
            ))}
          </div>
          <div className="relative -mt-10 flex justify-end pr-4">
            <ListingFavoriteButton listingId={l.id} />
          </div>
          {l.description.trim() && (
            <>
              <h2 className="mt-8 text-2xl font-bold">Descripción</h2>
              <p className="mt-2 whitespace-pre-line text-muted-foreground">{l.description}</p>
            </>
          )}
          {specs.some(([, value]) => value !== null && value !== "") && (
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specs
                .filter(([, value]) => value !== null && value !== "")
                .map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-muted p-4">
                    <dt className="text-xs text-muted-foreground">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
            </dl>
          )}
          {optionalDetails.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {optionalDetails.map(({ label, value }) => (
                <div key={label} className="rounded-2xl bg-muted p-4">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
            <h1 className="text-3xl font-extrabold leading-tight">
              {l.make} {l.model}
            </h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {l.province}
            </p>
            <p className="mt-4 font-display text-4xl font-extrabold">{formatListingPrice(l)}</p>
            <div className="mt-6 grid gap-2">
              <a
                href={`tel:+${whatsappNumber}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground hover:bg-primary/90"
              >
                Llamar al {contactPhone}
              </a>
              {l.whatsappEnabled && (
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 font-bold hover:bg-muted"
                >
                  <MessageCircle className="h-5 w-5" /> Contactar por WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={() => void shareListing()}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 font-bold hover:bg-muted"
              >
                <Share2 className="h-5 w-5" /> Compartir anuncio
              </button>
              {shareStatus && (
                <p role="status" className="text-center text-sm text-muted-foreground">
                  {shareStatus}
                </p>
              )}
            </div>
          </div>
          <div className="rounded-3xl bg-secondary p-6">
            {getListingSellerFirstName(l.seller) && (
              <p className="font-bold">{getListingSellerFirstName(l.seller)}</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              Publicación directa entre personas. No necesitas crear una cuenta. Verificá la
              información y el estado del vehículo antes de comprar.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
