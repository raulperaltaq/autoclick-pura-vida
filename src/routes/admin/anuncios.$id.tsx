import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAllListingsForAdmin,
  updateListing,
  updateListingStatus,
  type AdminListing,
} from "@/data/listings-repository";
import { AuthOnly } from "@/components/auth-only";
import { useAuth } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Truck, Save, ArrowLeft } from "lucide-react";

type LoaderData = { listing: AdminListing };

export const Route = createFileRoute("/admin/anuncios/$id")({
  head: ({ loaderData }: any) => {
    const l = (loaderData as LoaderData)?.listing;
    return {
      meta: [
        { title: l ? `${l.make} ${l.model} ${l.year} - Administración` : "Anuncio - Administración" },
        {
          name: "description",
          content: l
            ? `Gestioná el anuncio de ${l.make} ${l.model} ${l.year} en autoclick.cr.`
            : "Gestioná anuncios de vehículos en autoclick.cr.",
        },
      ],
    };
  },
  loader: async ({ params }) => {
    const listings = await fetchAllListingsForAdmin();
    const listing = listings.find((l) => l.id === params.id);
    if (!listing) throw notFound();
    return { listing };
  },
  component: EditListingPage,
});

const statusOptions: Array<{
  value: "pending_review" | "published" | "rejected" | "paused" | "sold";
  label: string;
  variant: string;
}> = [
  { value: "pending_review", label: "Pendiente de revisión", variant: "warning" },
  { value: "published", label: "Publicado", variant: "success" },
  { value: "rejected", label: "Rechazado", variant: "destructive" },
  { value: "paused", label: "Pausado", variant: "secondary" },
  { value: "sold", label: "Vendido", variant: "primary" },
];

function EditListingPage() {
  const { listing } = Route.useLoaderData() as LoaderData;
  const { profile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const [form, setForm] = useState({
    make: listing.make,
    model: listing.model,
    year: String(listing.year),
    price: String(listing.price),
    currency: listing.currency,
    km: listing.km !== null ? String(listing.km) : "",
    fuel: listing.fuel,
    transmission: listing.transmission,
    body: listing.body,
    province: listing.province,
    style: listing.style,
    condition: listing.condition,
    doors: listing.doors !== null ? String(listing.doors) : "",
    financing: listing.financing ? "sí" : listing.financing === false ? "no" : "",
    trade: listing.trade ? "sí" : listing.trade === false ? "no" : "",
    seller: listing.seller,
    phone: listing.phone,
    description: listing.description,
    plan: listing.plan,
    whatsapp_enabled: listing.whatsapp_enabled ? "sí" : "no",
  });

  const handleSave = useCallback(async () => {
    if (!listing) return;
    setIsSaving(true);
    try {
      const updates: Record<string, unknown> = {
        make: form.make.trim(),
        model: form.model.trim(),
        year: parseInt(form.year, 10) || 0,
        price: parseFloat(form.price) || 0,
        currency: form.currency as "CRC" | "USD",
        km: form.km ? parseInt(form.km, 10) : null,
        fuel: form.fuel as any,
        transmission: form.transmission as any,
        body: form.body as any,
        province: form.province.trim(),
        style: form.style.trim(),
        condition: form.condition as any,
        doors: form.doors ? parseInt(form.doors, 10) : null,
        financing: form.financing === "sí" ? true : form.financing === "no" ? false : null,
        trade: form.trade === "sí" ? true : form.trade === "no" ? false : null,
        seller: form.seller.trim(),
        phone: form.phone.trim(),
        description: form.description.trim(),
        plan: form.plan as any,
        whatsapp_enabled: form.whatsapp_enabled === "sí",
      };

      await updateListing(listing.id, updates);
      setEditing(false);
    } catch (error) {
      console.error("Error saving listing:", error);
      alert("No se pudo guardar el anuncio. Intentá nuevamente.");
    } finally {
      setIsSaving(false);
    }
  }, [listing, form]);

  const handleStatusChange = useCallback(
    async (status: string) => {
      if (!listing) return;
      setIsChangingStatus(true);
      try {
        await updateListingStatus(
          listing.id,
          status as
            | "pending_review"
            | "published"
            | "rejected"
            | "paused"
            | "sold",
        );
      } catch (error) {
        console.error("Error changing status:", error);
        alert("No se pudo cambiar el estado del anuncio.");
      } finally {
        setIsChangingStatus(false);
      }
    },
    [listing],
  );

  return (
    <AuthOnly allowedRoles={["admin"]}>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/admin">
              <ArrowLeft className="mr-2 h-5 w-5" /> Volver al panel
            </Link>
            <h1 className="mt-2 text-3xl font-extrabold">
              {listing.make} {listing.model} {listing.year}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              ID: {listing.id}{" · "}
              {profile?.email ? `Admin: ${profile.email}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{listing.status}</Badge>
            <Button onClick={() => setEditing(!editing)} disabled={isSaving || isChangingStatus}>
              {editing ? "Cancelar edición" : "Editar anuncio"}
            </Button>
          </div>
        </header>

        {/* Listing preview */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-2 lg:col-span-1">
              {listing.image_url ? (
                <img
                  src={listing.image_url}
                  alt={`${listing.make} ${listing.model}`}
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
              ) : (
                <div className="aspect-[4/3] w-full flex items-center justify-center rounded-xl bg-muted">
                  <Truck className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Precio
                </p>
                <p className="text-xl font-bold">
                  {new Intl.NumberFormat("es-CR", {
                    style: "currency",
                    currency: listing.currency,
                    maximumFractionDigits: 0,
                  }).format(listing.price)}
                </p>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Año</span>
                  <span>{listing.year}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Kilometraje</span>
                  <span>
                    {listing.km !== null ? listing.km.toLocaleString("es-CR") + " km" : "No especificado"}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Combustible</span>
                  <span>{listing.fuel}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Transmisión</span>
                  <span>{listing.transmission}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Carrocería</span>
                  <span>{listing.body}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Provincia</span>
                  <span>{listing.province}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Condición</span>
                  <span>{listing.condition}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Plan</span>
                  <span>{listing.plan}</span>
                </div>
              </div>
            </div>

            <div className="col-span-2 lg:col-span-2 space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Descripción
                </p>
                <p className="text-muted-foreground whitespace-pre-line">
                  {listing.description || "Sin descripción."}
                </p>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Vendedor</span>
                  <span>{listing.seller}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Teléfono</span>
                  <span>{listing.phone}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Financiamiento</span>
                  <span>{listing.financing === null ? "No especificado" : listing.financing ? "Sí" : "No"}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">Recibe vehículo</span>
                  <span>{listing.trade === null ? "No especificado" : listing.trade ? "Sí" : "No"}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-muted-foreground">WhatsApp</span>
                  <span>{listing.whatsapp_enabled ? "Habilitado" : "Deshabilitado"}</span>
                </div>
                {listing.published_at && (
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Publicado el</span>
                    <span>
                      {new Intl.DateTimeFormat("es-CR", { dateStyle: "medium" }).format(
                        new Date(listing.published_at),
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold">Editar datos del anuncio</h2>
            <form onSubmit={(e) => { e.preventDefault(); void handleSave(); }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold mb-1">Marca</label>
                <input
                  name="make"
                  defaultValue={form.make}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold mb-1">Modelo</label>
                <input
                  name="model"
                  defaultValue={form.model}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Año</label>
                <input
                  name="year"
                  type="number"
                  defaultValue={form.year}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Precio</label>
                <input
                  name="price"
                  type="number"
                  defaultValue={form.price}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Moneda</label>
                <select
                  name="currency"
                  defaultValue={form.currency}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="CRC">CRC (₡)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Kilometraje</label>
                <input
                  name="km"
                  type="number"
                  defaultValue={form.km}
                  placeholder="Opcional"
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Combustible</label>
                <select
                  name="fuel"
                  defaultValue={form.fuel}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Gasolina">Gasolina</option>
                  <option value="Diésel">Diésel</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Eléctrico">Eléctrico</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Transmisión</label>
                <select
                  name="transmission"
                  defaultValue={form.transmission}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Automática">Automática</option>
                  <option value="Manual">Manual</option>
                  <option value="CVT">CVT</option>
                  <option value="Doble embrague">Doble embrague</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Carrocería</label>
                <select
                  name="body"
                  defaultValue={form.body}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="SUV">SUV</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Sedán">Sedán</option>
                  <option value="Hatchback">Hatchback</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Provincia</label>
                <select
                  name="province"
                  defaultValue={form.province}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="San José">San José</option>
                  <option value="Alajuela">Alajuela</option>
                  <option value="Cartago">Cartago</option>
                  <option value="Heredia">Heredia</option>
                  <option value="Guanacaste">Guanacaste</option>
                  <option value="Limón">Limón</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Condición</label>
                <select
                  name="condition"
                  defaultValue={form.condition}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Nuevo">Nuevo</option>
                  <option value="Usado">Usado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Puertas</label>
                <input
                  name="doors"
                  type="number"
                  defaultValue={form.doors}
                  placeholder="Opcional"
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold mb-1">Vendedor</label>
                <input
                  name="seller"
                  defaultValue={form.seller}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold mb-1">Teléfono</label>
                <input
                  name="phone"
                  defaultValue={form.phone}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold mb-1">Descripción</label>
                <textarea
                  name="description"
                  defaultValue={form.description}
                  rows={3}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold mb-1">Plan de publicación</label>
                <select
                  name="plan"
                  defaultValue={form.plan}
                  className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="free">Gratuito</option>
                  <option value="featured">Destacado</option>
                  <option value="premium">Premium</option>
                  <option value="premium-plus">Premium Plus</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <Button type="submit" disabled={isSaving} className="w-full">
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Guardar cambios
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Status change section */}
        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Estado del anuncio</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Cambiá el estado de este anuncio. Al publicar, se establecerá la fecha de publicación automáticamente.
          </p>
          <div className="grid gap-3 sm:grid-cols-4">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => void handleStatusChange(opt.value)}
                disabled={isChangingStatus}
                className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm font-medium transition ${
                  listing.status === opt.value
                    ? `border-${opt.variant} bg-${opt.variant}/10 text-${opt.variant}`
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                <span className={`text-xs font-bold capitalize ${listing.status === opt.value ? "opacity-100" : "opacity-70"}`}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </AuthOnly>
  );
}