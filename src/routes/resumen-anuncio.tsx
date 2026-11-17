import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { publishListing } from "@/data/listings-repository";
import { getListingOptionalDetails } from "@/data/listings";
import { addOnServices, paidTags, tagPacks } from "@/data/monetization";
import {
  clearListingReviewDraft,
  getListingReviewDraft,
} from "@/lib/listing-review-draft";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/resumen-anuncio")({
  head: () => ({ meta: [{ title: "Revisá tu anuncio | autoclick.cr" }] }),
  component: ListingReviewPage,
});

const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);

function SummaryRow({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border py-3 text-sm last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}

function ListingReviewPage() {
  const { user } = useAuth();
  const [draft] = useState(getListingReviewDraft);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState("");
  const [published, setPublished] = useState(false);
  const photoUrls = useMemo(
    () => draft?.listing.photos.map((photo) => URL.createObjectURL(photo)) ?? [],
    [draft],
  );

  useEffect(
    () => () => photoUrls.forEach((url) => URL.revokeObjectURL(url)),
    [photoUrls],
  );

  if (!draft) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold">No hay un anuncio para revisar</h1>
        <p className="mt-3 text-muted-foreground">
          Volvé al formulario, completá los datos y seleccioná “Revisar anuncio”.
        </p>
        <Link to="/vender" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
          Ir a vender
        </Link>
      </main>
    );
  }

  const { listing, sellerEmail, secondaryPhones, whatsappPhone, selectedTags, selectedPacks, selectedServices } = draft;
  const optionalDetails = getListingOptionalDetails(listing.details);
  const mainPhotoIndex = Math.min(listing.mainPhotoIndex, photoUrls.length - 1);
  const selectedTagNames = selectedTags
    .map((id) => paidTags.find((tag) => tag.id === id)?.name)
    .filter((name): name is NonNullable<typeof name> => Boolean(name));
  const selectedPackNames = selectedPacks
    .map((id) => tagPacks.find((pack) => pack.id === id)?.name)
    .filter((name): name is NonNullable<typeof name> => Boolean(name));
  const selectedServiceNames = selectedServices
    .map((id) => addOnServices.find((service) => service.id === id)?.name)
    .filter((name): name is NonNullable<typeof name> => Boolean(name));

  const submit = async () => {
    if (!user) {
      setError("Iniciá sesión para enviar el anuncio a revisión.");
      return;
    }

    setError("");
    setIsPublishing(true);
    try {
      await publishListing(listing);
      clearListingReviewDraft();
      setPublished(true);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo enviar el anuncio. Intentá nuevamente.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (published) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold">Anuncio enviado a revisión</h1>
        <p className="mt-3 text-muted-foreground">
          Te avisaremos cuando la publicación sea aprobada.
        </p>
        <Link to="/mis-vehiculos" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground">
          Consultar mis vehículos
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <header className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Paso final</p>
        <h1 className="mt-2 text-4xl font-extrabold">Revisá tu anuncio</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Confirmá la información antes de enviarla a revisión. Todavía no se publicará.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
          <h2 className="text-2xl font-bold">{listing.year} {listing.make} {listing.model}</h2>
          <p className="mt-2 text-2xl font-extrabold text-primary">
            {formatPrice(listing.price, listing.currency)}
          </p>
          {listing.description && <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{listing.description}</p>}

          <dl className="mt-6">
            <SummaryRow label="Estilo" value={listing.style} />
            <SummaryRow label="Estado" value={listing.condition} />
            <SummaryRow label="Combustible" value={listing.fuel} />
            <SummaryRow label="Transmisión" value={listing.transmission} />
            <SummaryRow label="Kilometraje" value={listing.km === null ? null : `${new Intl.NumberFormat("es-CR").format(listing.km)} km`} />
            <SummaryRow label="Provincia" value={listing.province} />
            <SummaryRow label="Puertas" value={listing.doors} />
            <SummaryRow label="Financiamiento" value={listing.financing === null ? null : listing.financing ? "Sí" : "No"} />
            <SummaryRow label="Recibe vehículo" value={listing.trade === null ? null : listing.trade ? "Sí" : "No"} />
            {optionalDetails.map(({ label, value }) => <SummaryRow key={label} label={label} value={value} />)}
            <SummaryRow label="Etiquetas" value={selectedTagNames.join(", ")} />
            <SummaryRow label="Paquetes" value={selectedPackNames.join(", ")} />
            <SummaryRow label="Servicios" value={selectedServiceNames.join(", ")} />
          </dl>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-bold">Información del vendedor</h2>
            <dl className="mt-3">
              <SummaryRow label="Nombre" value={listing.seller} />
              <SummaryRow label="Correo" value={sellerEmail} />
              <SummaryRow label="Teléfono" value={listing.phone.replace(/^506/, "")} />
              <SummaryRow label="WhatsApp" value={whatsappPhone} />
              {secondaryPhones.map((phone, index) => <SummaryRow key={phone} label={`Teléfono ${index + 2}`} value={phone} />)}
              <SummaryRow label="Plan solicitado" value={listing.requestedPlan} />
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-bold">Fotos ({photoUrls.length})</h2>
            {photoUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {photoUrls.map((url, index) => (
                  <img
                    key={url}
                    src={url}
                    alt={`Foto ${index + 1} del vehículo`}
                    className={`aspect-[4/3] w-full rounded-lg object-cover ${index === mainPhotoIndex ? "ring-2 ring-primary" : ""}`}
                  />
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>

      {error && <p role="alert" className="mt-6 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={() => window.history.back()} className="rounded-full border border-border px-6 py-3 font-bold hover:bg-muted">
          Volver a editar
        </button>
        <button type="button" onClick={() => void submit()} disabled={isPublishing} className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60">
          {isPublishing ? "Enviando anuncio…" : "Enviar a revisión"}
        </button>
      </div>
    </main>
  );
}
