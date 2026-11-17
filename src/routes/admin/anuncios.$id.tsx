import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAllListingsForAdmin, type AdminListing } from "@/data/listings-repository";
import { adminUpdateListingStatus, adminUpdateListing } from "@/lib/admin-functions";
import { AuthOnly } from "@/components/auth-only";
import { useAuth } from "@/lib/use-auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Truck,
  ArrowLeft,
  Check,
  X,
  Pause,
  RotateCcw,
  Edit,
  Pencil,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { brands, styles } from "@/data/search-options";
import { provinces } from "@/data/listings";

type LoaderData = { listing: AdminListing };

export const Route = createFileRoute("/admin/anuncios/$id")({
  head: ({ loaderData }: { loaderData: LoaderData | undefined }) => {
    const l = loaderData?.listing;
    return {
      meta: [
        {
          title: l ? `${l.make} ${l.model} ${l.year} - Administración` : "Anuncio - Administración",
        },
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
  component: ViewListingPage,
});

function ViewListingPage() {
  const { listing } = Route.useLoaderData() as LoaderData;
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    make: listing.make,
    model: listing.model,
    year: String(listing.year),
    price: String(listing.price),
    currency: listing.currency,
    km: listing.km ?? "",
    fuel: listing.fuel,
    transmission: listing.transmission,
    body: listing.body,
    province: listing.province,
    style: listing.style,
    condition: listing.condition,
    doors: listing.doors ?? "",
    financing: listing.financing === null ? "" : listing.financing ? "Sí" : "No",
    trade: listing.trade === null ? "" : listing.trade ? "Sí" : "No",
    seller: listing.seller,
    phone: listing.phone,
    description: listing.description || "",
    plan: listing.plan,
    requested_plan: listing.requested_plan,
    whatsapp_enabled: listing.whatsapp_enabled,
    published_at: listing.published_at,
  });
  const [error, setError] = useState("");

  const updateStatusMutation = useMutation({
    mutationFn: (status: "pending_review" | "published" | "rejected" | "paused" | "sold") =>
      adminUpdateListingStatus({ listingId: listing.id, status }),
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-listing", listing.id] });
      const statusLabels: Record<string, string> = {
        published: "aprobado y publicado",
        rejected: "rechazado",
        paused: "pausado",
        pending_review: "movido a pendientes",
        sold: "marcado como vendido",
      };
      toast.success(`Anuncio ${statusLabels[status]}`);
    },
    onError: () => {
      toast.error("No se pudo actualizar el estado");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<AdminListing>) =>
      adminUpdateListing({ listingId: listing.id, updates: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-listing", listing.id] });
      setIsEditing(false);
      toast.success("Anuncio actualizado correctamente");
    },
    onError: () => {
      toast.error("No se pudo actualizar el anuncio");
    },
  });

  const handleStatusChange = (
    status: "pending_review" | "published" | "rejected" | "paused" | "sold",
  ) => {
    updateStatusMutation.mutate(status);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const year = Number(formData.year);
    const price = Number(formData.price);
    const km = formData.km ? Number(formData.km) : null;
    const doors = formData.doors ? Number(formData.doors) : null;

    if (!formData.make.trim() || !formData.model.trim()) {
      setError("Marca y modelo son obligatorios");
      return;
    }
    if (!Number.isInteger(year) || year < 1900 || year > new Date().getFullYear() + 1) {
      setError("Año inválido");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError("Precio inválido");
      return;
    }
    if (km !== null && (!Number.isFinite(km) || km < 0)) {
      setError("Kilometraje inválido");
      return;
    }
    if (doors !== null && (!Number.isInteger(doors) || doors < 1 || doors > 10)) {
      setError("Número de puertas inválido");
      return;
    }
    if (!/^506\d{8}$/.test(formData.phone.replace(/\D/g, ""))) {
      setError("Teléfono debe ser de Costa Rica (formato 506XXXXXXXX)");
      return;
    }

    const updates = {
      make: formData.make.trim(),
      model: formData.model.trim(),
      year,
      price,
      currency: formData.currency as "CRC" | "USD",
      km,
      fuel: formData.fuel,
      transmission: formData.transmission,
      body: formData.body,
      province: formData.province,
      style: formData.style,
      condition: formData.condition,
      doors,
      financing: formData.financing === "" ? null : formData.financing === "Sí",
      trade: formData.trade === "" ? null : formData.trade === "Sí",
      seller: formData.seller.trim(),
      phone: formData.phone.replace(/\D/g, ""),
      description: formData.description.trim(),
      plan: formData.plan,
      requested_plan: formData.requested_plan,
      whatsapp_enabled: formData.whatsapp_enabled,
    };

    updateMutation.mutate(updates);
  };

  const handleChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const transmissionOptions = ["Manual", "Automática", "CVT", "Doble embrague"] as const;
  const fuelOptions = ["Gasolina", "Diésel", "Híbrido", "Eléctrico"] as const;
  const conditionOptions = ["Nuevo", "Usado"] as const;
  const planOptions = ["free", "featured", "premium", "premium-plus"] as const;
  const yesNoOptions = ["Sí", "No"] as const;

  const renderField = (label: string, children: React.ReactNode) => (
    <div className="flex justify-between border-b pb-1">
      <Label className="text-muted-foreground">{label}</Label>
      {children}
    </div>
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
              {isEditing ? (
                <Input
                  value={formData.make + " " + formData.model + " " + formData.year}
                  onChange={(e) => {}}
                  readOnly
                  className="bg-transparent border-0 text-3xl font-extrabold"
                />
              ) : (
                <>
                  {listing.make} {listing.model} {listing.year}
                </>
              )}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              ID: {listing.id}
              {" · "}
              {profile?.email ? `Admin: ${profile.email}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{isEditing ? "Editando" : listing.status}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2" disabled={isEditing}>
                  <Edit className="h-4 w-4" />
                  {isEditing ? "Guardando..." : "Acciones"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Gestionar anuncio</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {!isEditing && (
                  <DropdownMenuItem
                    onClick={() => {
                      setFormData({
                        make: listing.make,
                        model: listing.model,
                        year: String(listing.year),
                        price: String(listing.price),
                        currency: listing.currency,
                        km: listing.km ?? "",
                        fuel: listing.fuel,
                        transmission: listing.transmission,
                        body: listing.body,
                        province: listing.province,
                        style: listing.style,
                        condition: listing.condition,
                        doors: listing.doors ?? "",
                        financing:
                          listing.financing === null ? "" : listing.financing ? "Sí" : "No",
                        trade: listing.trade === null ? "" : listing.trade ? "Sí" : "No",
                        seller: listing.seller,
                        phone: listing.phone,
                        description: listing.description || "",
                        plan: listing.plan,
                        requested_plan: listing.requested_plan,
                        whatsapp_enabled: listing.whatsapp_enabled,
                      });
                      setError("");
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" /> Editar anuncio
                  </DropdownMenuItem>
                )}
                {!isEditing && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={() => handleStatusChange("published")}
                  disabled={updateStatusMutation.isPending || isEditing}
                  className="flex items-center gap-2 text-green-600"
                >
                  <Check className="h-4 w-4" /> Aprobar y publicar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("rejected")}
                  disabled={updateStatusMutation.isPending || isEditing}
                  className="flex items-center gap-2 text-red-600"
                >
                  <X className="h-4 w-4" /> Rechazar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("paused")}
                  disabled={updateStatusMutation.isPending || isEditing}
                  className="flex items-center gap-2 text-yellow-600"
                >
                  <Pause className="h-4 w-4" /> Pausar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("pending_review")}
                  disabled={updateStatusMutation.isPending || isEditing}
                  className="flex items-center gap-2 text-blue-600"
                >
                  <RotateCcw className="h-4 w-4" /> Mover a pendientes
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("sold")}
                  disabled={updateStatusMutation.isPending || isEditing}
                  className="flex items-center gap-2 text-purple-600"
                >
                  Marcar como vendido
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Listing preview/edit form */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="col-span-2 lg:col-span-1">
              {listing.image_url ? (
                <img
                  src={listing.image_url}
                  alt={`${formData.make} ${formData.model}`}
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
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="1"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      className="flex-1"
                    />
                    <Select
                      value={formData.currency}
                      onValueChange={(v) => handleChange("currency", v)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CRC">₡</SelectItem>
                        <SelectItem value="USD">US$</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <p className="text-xl font-bold">
                    {new Intl.NumberFormat("es-CR", {
                      style: "currency",
                      currency: listing.currency,
                      maximumFractionDigits: 0,
                    }).format(listing.price)}
                  </p>
                )}
              </div>
              <div className="grid gap-2 text-sm">
                {renderField(
                  "Año",
                  isEditing ? (
                    <Input
                      type="number"
                      min={1900}
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={(e) => handleChange("year", e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    formData.year
                  ),
                )}
                {renderField(
                  "Kilometraje",
                  isEditing ? (
                    <Input
                      type="number"
                      min={0}
                      value={formData.km}
                      onChange={(e) => handleChange("km", e.target.value)}
                      placeholder="Ej. 38000"
                      className="w-full"
                    />
                  ) : formData.km ? (
                    formData.km.toLocaleString("es-CR") + " km"
                  ) : (
                    "No especificado"
                  ),
                )}
                {renderField(
                  "Combustible",
                  isEditing ? (
                    <Select
                      value={formData.fuel}
                      onValueChange={(v) => handleChange("fuel", v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná" />
                      </SelectTrigger>
                      <SelectContent>
                        {fuelOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    formData.fuel
                  ),
                )}
                {renderField(
                  "Transmisión",
                  isEditing ? (
                    <Select
                      value={formData.transmission}
                      onValueChange={(v) => handleChange("transmission", v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná" />
                      </SelectTrigger>
                      <SelectContent>
                        {transmissionOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    formData.transmission
                  ),
                )}
                {renderField(
                  "Carrocería",
                  isEditing ? (
                    <Select
                      value={formData.body}
                      onValueChange={(v) => handleChange("body", v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="Pickup">Pickup</SelectItem>
                        <SelectItem value="Sedán">Sedán</SelectItem>
                        <SelectItem value="Hatchback">Hatchback</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    formData.body
                  ),
                )}
                {renderField(
                  "Provincia",
                  isEditing ? (
                    <Select
                      value={formData.province}
                      onValueChange={(v) => handleChange("province", v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    formData.province
                  ),
                )}
                {renderField(
                  "Condición",
                  isEditing ? (
                    <Select
                      value={formData.condition}
                      onValueChange={(v) => handleChange("condition", v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOptions.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    formData.condition
                  ),
                )}
                {renderField(
                  "Plan",
                  isEditing ? (
                    <Select
                      value={formData.plan}
                      onValueChange={(v) => handleChange("plan", v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {planOptions.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    formData.plan
                  ),
                )}
              </div>
            </div>

            <div className="col-span-2 lg:col-span-2 space-y-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Descripción
                </p>
                {isEditing ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={4}
                    placeholder="Descripción del vehículo..."
                  />
                ) : (
                  <p className="text-muted-foreground whitespace-pre-line">
                    {formData.description || "Sin descripción."}
                  </p>
                )}
              </div>
              <div className="grid gap-2 text-sm">
                {renderField(
                  "Vendedor",
                  isEditing ? (
                    <Input
                      value={formData.seller}
                      onChange={(e) => handleChange("seller", e.target.value)}
                      placeholder="Solo nombre"
                      className="w-full"
                    />
                  ) : (
                    formData.seller
                  ),
                )}
                {renderField(
                  "Teléfono",
                  isEditing ? (
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="506XXXXXXXX"
                      className="w-full"
                    />
                  ) : (
                    formData.phone
                  ),
                )}
                {renderField(
                  "Financiamiento",
                  isEditing ? (
                    <Select
                      value={formData.financing}
                      onValueChange={(v) => handleChange("financing", v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sí">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : formData.financing === "" ? (
                    "No especificado"
                  ) : formData.financing === "true" ? (
                    "Sí"
                  ) : (
                    "No"
                  ),
                )}
                {renderField(
                  "Recibe vehículo",
                  isEditing ? (
                    <Select
                      value={formData.trade}
                      onValueChange={(v) => handleChange("trade", v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sí">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : formData.trade === "" ? (
                    "No especificado"
                  ) : formData.trade === "true" ? (
                    "Sí"
                  ) : (
                    "No"
                  ),
                )}
                {renderField(
                  "WhatsApp",
                  isEditing ? (
                    <Select
                      value={String(formData.whatsapp_enabled)}
                      onValueChange={(v) => handleChange("whatsapp_enabled", v === "true")}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Habilitado</SelectItem>
                        <SelectItem value="false">Deshabilitado</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : formData.whatsapp_enabled ? (
                    "Habilitado"
                  ) : (
                    "Deshabilitado"
                  ),
                )}
                {formData.published_at &&
                  renderField(
                    "Publicado el",
                    new Intl.DateTimeFormat("es-CR", { dateStyle: "medium" }).format(
                      new Date(formData.published_at),
                    ),
                  )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end gap-3 border-t pt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex items-center gap-2"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Guardar cambios
              </Button>
            </div>
          )}
        </form>
      </main>
    </AuthOnly>
  );
}
