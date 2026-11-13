import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent, ReactNode } from "react";
import { provinces } from "@/data/listings";
import { publishListing } from "@/data/listings-repository";
import {
  addOnServices,
  agencyPlans,
  calculateListingEstimate,
  getPhotoLimit,
  includedBenefits,
  listingPlans,
  paidTags,
  tagPacks,
  tagPrice,
} from "@/data/monetization";
import type { AddOnId, ListingPlanId } from "@/data/monetization";
import { styles } from "@/data/search-options";
import { useAuth } from "@/lib/use-auth";
import { isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/vender")({
  head: () => ({
    meta: [
      { title: "Vendé tu carro en Costa Rica | autoclick.cr" },
      {
        name: "description",
        content: "Publicá tu vehículo y contactá directamente con compradores en Costa Rica.",
      },
      { property: "og:title", content: "Vendé tu carro | autoclick.cr" },
      { property: "og:description", content: "Publicá gratis en menos de 2 minutos." },
    ],
  }),
  component: Vender,
});

const field =
  "w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring";
const selectField = `${field} cursor-pointer`;
const extras = [
  "Dirección hidráulica/electroasistida",
  "Cierre central",
  "Asientos eléctricos",
  "Vidrios tintados",
  "Airbags",
  "Vidrios eléctricos",
  "Espejos eléctricos",
  "Alarma",
  "Frenos ABS",
  "Aire acondicionado",
  "Desempañador trasero",
  "Sunroof / techo panorámico",
  "Aros de lujo",
  "Turbo",
  "Tapicería de cuero",
  "Halógenos",
  "Cámara 360°",
  "Android Auto",
  "Cruise Control",
  "Radio USB/AUX",
  "Revisión técnica al día",
  "Control electrónico de estabilidad",
  "Control de descenso",
  "Caja dual",
  "Cámara de retroceso",
  "Sensores de retroceso",
  "Sensores frontales",
  "Control de radio en volante",
  "Volante multifuncional",
  "Climatizador",
  "Asientos con memoria",
  "Retrovisores auto-retractibles",
  "Luces Xenón/Bixenón",
  "Sensor de lluvia",
  "Llave inteligente / Push Start",
  "Apple CarPlay",
  "Computadora de viaje",
  "Volante ajustable",
  "Bluetooth",
];
const transmissionOptions = ["Manual", "Automática", "CVT", "Doble embrague"] as const;
const fuelOptions = ["Gasolina", "Diésel", "Híbrido", "Eléctrico"] as const;
const conditionOptions = ["Nuevo", "Usado"] as const;
const publicDetailFields = new Set([
  "engine_cc",
  "passengers",
  "negotiable",
  "exterior_color",
  "interior_color",
  "autonomy_km",
  "battery_kwh",
  "taxes_paid",
  "plate",
  "canton",
  "previous_owners",
  "average_consumption",
  "battery_condition",
  "warranty",
  "seller_type",
  "youtube_url",
  "maintenance_history",
  "extras",
]);

function isOneOf<T extends string>(value: string, choices: readonly T[]): value is T {
  return choices.some((choice) => choice === value);
}

const formatColones = (amount: number) =>
  `₡${new Intl.NumberFormat("es-CR", { maximumFractionDigits: 0 }).format(amount).replace(/[,\u00a0]/g, ".")}`;

const getPhotoError = (count: number, limit: number) => {
  if (count < 2) return "Seleccioná al menos 2 fotos.";
  if (count > limit) return `El plan seleccionado permite hasta ${limit} fotos.`;
  return "";
};

function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-1 text-destructive">
      *
    </span>
  );
}

function Field({
  label,
  required = false,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`grid content-start gap-1.5 text-sm font-semibold ${className}`}>
      <span>
        {label}
        {required && <RequiredMark />}
      </span>
      {children}
    </label>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-5">
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function SelectField({
  label,
  name,
  options,
  placeholder = "Seleccioná una opción",
  className = "",
  required = false,
}: {
  label: string;
  name: string;
  options: string[];
  placeholder?: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <Field label={label} className={className}>
      <select className={selectField} name={name} defaultValue="" required={required}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}

function CheckOption({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm font-medium hover:bg-muted/60">
      <input
        type="checkbox"
        name={name}
        value={label}
        checked={checked}
        onChange={onChange ? (event) => onChange(event.target.checked) : undefined}
        className="mt-0.5 h-4 w-4 accent-primary"
      />
      <span>{label}</span>
    </label>
  );
}

function Vender() {
  const {
    user,
    profile,
    isLoading: isAuthLoading,
    profileError,
    refreshProfile,
    signOut,
  } = useAuth();
  const [activeAudience, setActiveAudience] = useState<"individual" | "agency">("individual");
  const [selectedPlan, setSelectedPlan] = useState<ListingPlanId>("free");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPacks, setSelectedPacks] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<AddOnId[]>([]);
  const [selectedAgencyPlan, setSelectedAgencyPlan] = useState<
    (typeof agencyPlans)[number]["id"] | null
  >(null);
  const [agencyActionNotice, setAgencyActionNotice] = useState("");
  const [agencyAuthError, setAgencyAuthError] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [mainPhoto, setMainPhoto] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [publishMessage, setPublishMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const hasExtraPhotos = selectedServices.includes("extra-photos");
  const photoLimit = getPhotoLimit(selectedPlan, hasExtraPhotos);
  const estimate = calculateListingEstimate({
    plan: selectedPlan,
    selectedTags,
    selectedPacks,
    selectedServices,
  });
  const selectedPackTags = new Set<string>(
    tagPacks.filter((pack) => selectedPacks.includes(pack.id)).flatMap((pack) => pack.tags),
  );
  const selectedPackOptions = tagPacks.filter((pack) => selectedPacks.includes(pack.id));
  const selectedTagIds = new Set([...selectedTags, ...selectedPackTags]);
  const photoPreviews = useMemo(
    () => photos.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [photos],
  );

  const handleAgencySignOut = async () => {
    try {
      await signOut();
      setAgencyAuthError("");
    } catch (error) {
      console.error("Could not sign out before switching to an agency account:", error);
      setAgencyAuthError("No se pudo cerrar la sesión. Intentá nuevamente.");
    }
  };

  useEffect(
    () => () => photoPreviews.forEach(({ url }) => URL.revokeObjectURL(url)),
    [photoPreviews],
  );
  useEffect(() => {
    const error = getPhotoError(photos.length, photoLimit);
    setPhotoError(error);
    fileInput.current?.setCustomValidity(error);
  }, [photos.length, photoLimit]);

  const updatePhotos = (files: FileList | File[]) => {
    const selected = Array.from(files);
    const images = selected.filter((file) => file.type.startsWith("image/"));
    if (images.length !== selected.length) {
      const error = "Solo se permiten archivos de imagen.";
      setPhotoError(error);
      fileInput.current?.setCustomValidity(error);
      return;
    }

    setPhotos(images.slice(0, 20));
    setMainPhoto(0);
    const error = getPhotoError(images.length, photoLimit);
    setPhotoError(error);
    fileInput.current?.setCustomValidity(error);
  };

  const onPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    updatePhotos(event.currentTarget.files ?? []);
  };

  const onPhotoDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (!fileInput.current || !files.length) return;

    const transfer = new DataTransfer();
    Array.from(files).forEach((file) => transfer.items.add(file));
    fileInput.current.files = transfer.files;
    updatePhotos(files);
  };

  const removePhoto = (index: number) => {
    const remaining = photos.filter((_, photoIndex) => photoIndex !== index);
    setPhotos(remaining);
    setMainPhoto((current) => (current === index ? 0 : current > index ? current - 1 : current));
    const error = getPhotoError(remaining.length, photoLimit);
    setPhotoError(error);

    if (fileInput.current) {
      const transfer = new DataTransfer();
      remaining.forEach((file) => transfer.items.add(file));
      fileInput.current.files = transfer.files;
      fileInput.current.setCustomValidity(error);
    }
  };

  const toggleTag = (tagId: string, checked: boolean) => {
    setSelectedTags((current) =>
      checked ? [...new Set([...current, tagId])] : current.filter((id) => id !== tagId),
    );
  };

  const toggleService = (serviceId: AddOnId, checked: boolean) => {
    setSelectedServices((current) => {
      const boostIds: AddOnId[] = ["boost-7-days", "boost-30-days"];
      const withoutBoosts = current.filter((id) => !boostIds.includes(id));

      if (boostIds.includes(serviceId)) {
        return checked ? [...withoutBoosts, serviceId] : current.filter((id) => id !== serviceId);
      }

      return checked
        ? [...new Set([...current, serviceId])]
        : current.filter((id) => id !== serviceId);
    });
  };

  const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPublishError("");
    setPublishMessage("");

    if (!user) {
      setPublishError("Iniciá sesión para guardar el anuncio en tu cuenta.");
      return;
    }
    if (photoError) {
      setPublishError(photoError);
      return;
    }

    setIsPublishing(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const text = (key: string) => String(formData.get(key) ?? "").trim();
    const numeric = (key: string, required = false): number | null => {
      const raw = text(key);
      if (!raw) {
        if (required) throw new Error(`Completá el campo ${key}.`);
        return null;
      }
      const value = Number(raw);
      if (!Number.isFinite(value)) throw new Error(`Revisá el campo ${key}.`);
      return value;
    };

    try {
      const style = text("style");
      const normalizedStyle = style.toLocaleLowerCase("es-CR");
      const body = normalizedStyle.includes("pick up")
        ? "Pickup"
        : normalizedStyle.includes("sedán") || normalizedStyle.includes("sedan")
          ? "Sedán"
          : normalizedStyle.includes("hatchback")
            ? "Hatchback"
            : "SUV";
      const detailValues: Record<string, string | string[]> = {};
      for (const [key, value] of formData.entries()) {
        if (typeof value === "string" && publicDetailFields.has(key) && value.trim()) {
          const current = detailValues[key];
          detailValues[key] = current
            ? [...(Array.isArray(current) ? current : [current]), value]
            : value;
        }
      }

      const phone = text("phone").replace(/\D/g, "");
      const fuel = text("fuel");
      const transmission = text("transmission");
      const condition = text("condition");
      const year = numeric("year", true);
      const price = numeric("price", true);
      if (year === null || price === null) {
        throw new Error("Completá el año y el precio del vehículo.");
      }
      if (!isOneOf(fuel, fuelOptions)) throw new Error("Seleccioná el combustible del vehículo.");
      if (!isOneOf(transmission, transmissionOptions))
        throw new Error("Seleccioná la transmisión.");
      if (!isOneOf(condition, conditionOptions))
        throw new Error("Seleccioná el estado del vehículo.");

      await publishListing({
        make: text("make"),
        model: text("model"),
        year,
        price,
        currency: text("currency") === "USD" ? "USD" : "CRC",
        km: numeric("km"),
        fuel,
        transmission,
        body,
        province: text("province"),
        style,
        condition,
        doors: numeric("doors"),
        financing: text("financing") === "" ? null : text("financing") === "Sí",
        trade: text("trade") === "" ? null : text("trade") === "Sí",
        seller: text("seller").split(/\s+/)[0] ?? "",
        phone: phone.startsWith("506") ? phone : `506${phone}`,
        description: text("description"),
        requestedPlan: selectedPlan,
        details: detailValues,
        photos,
        mainPhotoIndex: mainPhoto,
        extraPhotos: hasExtraPhotos,
      });

      form.reset();
      setPhotos([]);
      setMainPhoto(0);
      setSelectedPlan("free");
      setSelectedTags([]);
      setSelectedPacks([]);
      setSelectedServices([]);
      setPublishMessage("Anuncio enviado a revisión. Se publicará cuando sea aprobado.");
    } catch (error) {
      console.error("Could not submit vehicle listing:", error);
      setPublishError(
        error instanceof Error
          ? error.message
          : "No se pudo enviar el anuncio. Intentá nuevamente.",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <header className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">
          {listingPlans.find((plan) => plan.id === selectedPlan)?.name}
        </p>
        <h1 className="mt-2 text-4xl font-extrabold">Publicá tu vehículo</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Completá la información del vehículo y tus datos para que las personas interesadas puedan
          contactarte directamente.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Los campos marcados con <RequiredMark /> son obligatorios.
        </p>
      </header>

      <section className="mb-8 text-center" aria-label="Tipo de usuario">
        <div
          role="tablist"
          aria-label="Seleccioná tu tipo de usuario"
          className="mx-auto mb-5 inline-flex max-w-full flex-wrap justify-center gap-1 rounded-full bg-muted p-1"
        >
          <button
            type="button"
            id="individual-tab"
            role="tab"
            aria-selected={activeAudience === "individual"}
            aria-controls="individual-panel"
            tabIndex={activeAudience === "individual" ? 0 : -1}
            onClick={() => setActiveAudience("individual")}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                setActiveAudience(activeAudience === "individual" ? "agency" : "individual");
                event.currentTarget.parentElement
                  ?.querySelector<HTMLButtonElement>('[role="tab"]:not(:focus)')
                  ?.focus();
              }
            }}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeAudience === "individual"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Particulares
          </button>
          <button
            type="button"
            id="agency-tab"
            role="tab"
            aria-selected={activeAudience === "agency"}
            aria-controls="agency-panel"
            tabIndex={activeAudience === "agency" ? 0 : -1}
            onClick={() => setActiveAudience("agency")}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                setActiveAudience(activeAudience === "agency" ? "individual" : "agency");
                event.currentTarget.parentElement
                  ?.querySelector<HTMLButtonElement>('[role="tab"]:not(:focus)')
                  ?.focus();
              }
            }}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeAudience === "agency"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Agencias
          </button>
        </div>
        <div className="grid">
          <div
            id="individual-panel"
            role="tabpanel"
            aria-labelledby="individual-tab"
            aria-hidden={activeAudience !== "individual"}
            className={`col-start-1 row-start-1 transition-all duration-300 ease-in-out ${
              activeAudience === "individual"
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            }`}
          >
            <h2 className="text-2xl font-bold">Vende tu carro como particular</h2>
            <p className="mt-2 text-muted-foreground">
              Publica tu vehículo y llega a miles de compradores en Costa Rica.
            </p>
          </div>
          <div
            id="agency-panel"
            role="tabpanel"
            aria-labelledby="agency-tab"
            aria-hidden={activeAudience !== "agency"}
            className={`col-start-1 row-start-1 transition-all duration-300 ease-in-out ${
              activeAudience === "agency"
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            }`}
          >
            <h2 className="text-2xl font-bold">Soluciones para agencias</h2>
            <p className="mt-2 text-muted-foreground">
              Administra tu inventario y publica múltiples vehículos desde una sola plataforma.
            </p>
            {activeAudience === "agency" && (
              <>
                <Section
                  title="Planes para agencias y lotes"
                  description="Elegí el plan que mejor se adapta a tu inventario."
                >
                  <div
                    className="grid gap-4 sm:grid-cols-2"
                    role="radiogroup"
                    aria-label="Planes para agencias"
                  >
                    {agencyPlans.map((plan) => (
                      <label
                        key={plan.id}
                        className={`relative flex cursor-pointer flex-col rounded-2xl border p-5 text-left transition ${
                          selectedAgencyPlan === plan.id
                            ? "border-primary bg-secondary/60 ring-2 ring-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {"badge" in plan && (
                          <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">
                            {plan.badge}
                          </span>
                        )}
                        <span className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="agency-plan"
                            value={plan.id}
                            checked={selectedAgencyPlan === plan.id}
                            onChange={() => setSelectedAgencyPlan(plan.id)}
                            className="mt-1 h-4 w-4 accent-primary"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-baseline justify-between gap-2 text-lg font-bold">
                              <span>{plan.name}</span>
                              <span className="text-primary">
                                {formatColones(plan.pricePerMonth)} / mes
                              </span>
                            </span>
                            <span className="mt-1 block text-sm text-muted-foreground">
                              {plan.description}
                            </span>
                          </span>
                        </span>
                        <span className="mt-4 grid gap-2 text-sm text-muted-foreground">
                          {plan.features.map((feature) => (
                            <span key={feature} className="flex gap-2">
                              <span aria-hidden="true" className="text-primary">
                                ✓
                              </span>
                              <span>{feature}</span>
                            </span>
                          ))}
                        </span>
                      </label>
                    ))}
                  </div>
                </Section>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  {isAuthLoading ? (
                    <p role="status" className="text-sm text-muted-foreground">
                      Verificando sesión…
                    </p>
                  ) : user && !profile ? (
                    <div className="text-center">
                      <p role="alert" className="text-sm text-destructive">
                        {profileError ?? "No se pudo cargar el perfil de tu cuenta."}
                      </p>
                      <button
                        type="button"
                        onClick={() => void refreshProfile()}
                        className="mt-2 font-semibold text-primary hover:underline"
                      >
                        Reintentar
                      </button>
                    </div>
                  ) : profile?.role === "agency" ? (
                    <button
                      type="button"
                      disabled={!selectedAgencyPlan}
                      onClick={() =>
                        setAgencyActionNotice(
                          "Los pagos estarán disponibles cuando se habilite la plataforma de pagos.",
                        )
                      }
                      className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Proceder al pago
                    </button>
                  ) : user ? (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Los planes requieren una cuenta de agencia. Cerrá sesión para acceder o
                        crear una.
                      </p>
                      <button
                        type="button"
                        onClick={() => void handleAgencySignOut()}
                        className="mt-3 rounded-full border border-border px-6 py-3 font-bold transition hover:bg-muted"
                      >
                        Cerrar sesión
                      </button>
                      {agencyAuthError && (
                        <p role="alert" className="mt-2 text-sm text-destructive">
                          {agencyAuthError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <Link
                        to="/acceder"
                        search={{ mode: "signup", role: "agency" }}
                        className="rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                      >
                        Crear cuenta
                      </Link>
                      <Link
                        to="/acceder"
                        search={{ mode: "login", role: "agency" }}
                        className="rounded-full border border-border bg-transparent px-6 py-3 font-bold text-foreground transition hover:bg-muted"
                      >
                        Login
                      </Link>
                    </>
                  )}
                </div>
                {agencyActionNotice && (
                  <p role="status" className="text-center text-sm text-muted-foreground">
                    {agencyActionNotice}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {activeAudience === "individual" && isAuthLoading ? (
        <p
          role="status"
          className="rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground"
        >
          Verificando sesión…
        </p>
      ) : activeAudience === "individual" && (!user || profile?.role !== "agency") ? (
        <form onSubmit={(event) => void handlePublish(event)} className="space-y-6">
          <p role="status" className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            La publicación requiere una cuenta y aprobación; recibirás confirmación antes de que el
            anuncio aparezca públicamente. Los planes y servicios seleccionados se guardan como
            solicitud; no se activan beneficios pagos ni se procesa ningún cobro desde este
            formulario.
          </p>
          {!user && (
            <p className="rounded-xl border border-border p-4 text-sm">
              <Link
                to="/acceder"
                search={{ mode: "login", role: "seller" }}
                className="font-semibold text-primary"
              >
                Iniciá sesión
              </Link>{" "}
              para guardar el anuncio y sus fotografías en tu cuenta.
            </p>
          )}
          {!isSupabaseConfigured && (
            <p
              role="alert"
              className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive"
            >
              La conexión con Supabase no está configurada en este entorno.
            </p>
          )}
          <Section
            title="Impulsa tu anuncio"
            description="Elegí cómo querés destacar el vehículo. Los precios son un estimado informativo."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {listingPlans.map((plan) => (
                <label
                  key={plan.id}
                  className={`relative flex cursor-pointer flex-col rounded-2xl border p-5 transition ${
                    selectedPlan === plan.id
                      ? "border-primary bg-secondary/60 ring-2 ring-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="flex items-center gap-2 text-lg font-bold">
                      <input
                        type="radio"
                        name="listing-plan"
                        value={plan.id}
                        checked={selectedPlan === plan.id}
                        onChange={() => setSelectedPlan(plan.id)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span>
                        {plan.icon} {plan.name}
                      </span>
                    </span>
                    <span className="grid justify-items-end gap-2">
                      <span className="flex flex-wrap items-baseline justify-end gap-x-2">
                        {"previousPrice" in plan && (
                          <span className="text-sm font-medium text-muted-foreground line-through">
                            {formatColones(plan.previousPrice)}
                          </span>
                        )}
                        <span className="shrink-0 text-lg font-extrabold">
                          {formatColones(plan.price)}
                        </span>
                      </span>
                      {"discountLabel" in plan && (
                        <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-bold text-destructive">
                          {plan.discountLabel}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="mt-2 text-sm text-muted-foreground">{plan.tagline}</span>
                  <ul className="mt-4 grid gap-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span
                          aria-hidden="true"
                          className={
                            feature.startsWith("Requiere aprobación")
                              ? "font-bold text-destructive"
                              : "text-primary"
                          }
                        >
                          {feature.startsWith("Requiere aprobación") ? "✕" : "✓"}
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.id === "featured" && (
                      <li className="flex gap-2 text-muted-foreground">
                        <span aria-hidden="true">↗</span>
                        <span>Objetivo promocional: hasta 3 veces más visualizaciones</span>
                      </li>
                    )}
                  </ul>
                </label>
              ))}
            </div>
            <p className="mt-5 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
              Seleccionar opciones solo calcula un estimado: todavía no se realizan cobros ni se
              activan promociones. La publicación gratuita requiere aprobación y tarda entre 1 y 2
              horas; Premium Plus ofrece publicación automática inmediata según el plan. Los
              beneficios de pago estarán disponibles cuando se habiliten pagos y almacenamiento;
              servicios como inspección y difusión requieren además su operación correspondiente.
            </p>
          </Section>

          <Section
            title="Información del vehículo"
            description="Los datos principales que verá quien busque tu vehículo."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Marca" required>
                <input
                  required
                  name="make"
                  autoComplete="off"
                  placeholder="Ej. Toyota"
                  className={field}
                />
              </Field>
              <Field label="Modelo" required>
                <input
                  required
                  name="model"
                  autoComplete="off"
                  placeholder="Ej. RAV4"
                  className={field}
                />
              </Field>
              <Field label="Cilindrada (cc)">
                <input
                  name="engine_cc"
                  type="number"
                  min={0}
                  placeholder="Ej. 2000"
                  className={field}
                />
              </Field>
              <SelectField label="Estilo" name="style" options={styles} required />
              <Field label="Número de pasajeros">
                <input
                  name="passengers"
                  type="number"
                  min={1}
                  max={60}
                  placeholder="Ej. 5"
                  className={field}
                />
              </Field>
              <Field label="Año" required>
                <input
                  type="number"
                  name="year"
                  min={1900}
                  max={new Date().getFullYear() + 1}
                  required
                  placeholder="Ej. 2022"
                  className={field}
                />
              </Field>
              <SelectField
                label="Estado"
                name="condition"
                options={conditionOptions.slice()}
                required
              />
              <Field label="Precio" required>
                <div className="flex gap-2">
                  <input
                    required
                    type="number"
                    name="price"
                    min={0}
                    step="0.01"
                    placeholder="Precio"
                    className={`${field} min-w-0 flex-1`}
                  />
                  <select
                    aria-label="Moneda del precio"
                    name="currency"
                    className="w-36 shrink-0 rounded-xl border border-input bg-card px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    defaultValue="CRC"
                  >
                    <option value="CRC">Colones (₡)</option>
                    <option value="USD">Dólares (US$)</option>
                  </select>
                </div>
              </Field>
              <SelectField label="Precio negociable" name="negotiable" options={["Sí", "No"]} />
              <Field label="Color exterior">
                <input name="exterior_color" placeholder="Ej. Blanco" className={field} />
              </Field>
              <Field label="Color interior">
                <input name="interior_color" placeholder="Ej. Negro" className={field} />
              </Field>
              <SelectField label="Combustible" name="fuel" options={fuelOptions.slice()} required />
              <Field label="Autonomía (km, para eléctricos)">
                <input
                  name="autonomy_km"
                  type="number"
                  min={0}
                  placeholder="Ej. 450"
                  className={field}
                />
              </Field>
              <Field label="Batería (kWh, para eléctricos)">
                <input
                  name="battery_kwh"
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder="Ej. 75"
                  className={field}
                />
              </Field>
              <SelectField
                label="Transmisión"
                name="transmission"
                options={transmissionOptions.slice()}
                required
              />
              <Field label="Kilometraje">
                <input name="km" type="number" min={0} placeholder="Ej. 38000" className={field} />
              </Field>
              <SelectField label="Impuestos pagados" name="taxes_paid" options={["Sí", "No"]} />
              <SelectField label="Recibe vehículo" name="trade" options={["Sí", "No"]} />
              <Field label="Placa">
                <input name="plate" placeholder="Opcional" className={field} />
              </Field>
              <Field label="Número de puertas">
                <input
                  name="doors"
                  type="number"
                  min={1}
                  max={10}
                  placeholder="Ej. 4"
                  className={field}
                />
              </Field>
              <SelectField label="Provincia" name="province" options={provinces} required />
              <Field label="Cantón">
                <input name="canton" placeholder="Ej. Escazú" className={field} />
              </Field>
              <Field label="Dueños anteriores">
                <input
                  name="previous_owners"
                  type="number"
                  min={0}
                  placeholder="Opcional"
                  className={field}
                />
              </Field>
              <Field label="Consumo promedio (km/l)">
                <input
                  name="average_consumption"
                  type="number"
                  min={0}
                  step="0.1"
                  placeholder="Opcional"
                  className={field}
                />
              </Field>
              <Field label="Estado de la batería (para eléctricos)">
                <input
                  name="battery_condition"
                  placeholder="Ej. 90% de capacidad"
                  className={field}
                />
              </Field>
              <SelectField
                label="Financiamiento disponible"
                name="financing"
                options={["Sí", "No"]}
              />
              <Field label="Garantía">
                <input name="warranty" placeholder="Ej. 1 año" className={field} />
              </Field>
              <SelectField
                label="Tipo de vendedor"
                name="seller_type"
                options={["Particular", "Agencia"]}
              />
              <Field label="Video del vehículo (YouTube)" className="sm:col-span-2">
                <input
                  name="youtube_url"
                  type="url"
                  placeholder="https://youtube.com/..."
                  className={field}
                />
              </Field>
              <Field label="Comentario adicional" className="sm:col-span-2">
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Contá el estado, mantenimientos, extras y cualquier detalle importante…"
                  className={field}
                />
              </Field>
              <Field label="Historial de mantenimiento" className="sm:col-span-2">
                <textarea
                  name="maintenance_history"
                  rows={3}
                  placeholder="Opcional"
                  className={field}
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Equipamiento / Extras"
            description="Seleccioná todo lo que incluye el vehículo."
          >
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {extras.map((extra) => (
                <CheckOption key={extra} name="extras" label={extra} />
              ))}
            </div>
          </Section>

          <Section
            title="Etiquetas destacadas"
            description={`Opcionales: ${formatColones(tagPrice)} cada una, o elegí un paquete.`}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                  selectedPacks.length === 0
                    ? "border-primary bg-secondary/60"
                    : "border-border hover:bg-muted/60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedPacks.length === 0}
                  onChange={() => setSelectedPacks([])}
                  className="mt-1 h-4 w-4 accent-primary"
                />
                <span className="font-semibold">Sin pack de etiquetas</span>
              </label>
              {tagPacks.map((pack) => (
                <label
                  key={pack.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${
                    selectedPacks.includes(pack.id)
                      ? "border-primary bg-secondary/60"
                      : "border-border hover:bg-muted/60"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPacks.includes(pack.id)}
                    onChange={(event) => {
                      setSelectedPacks((current) =>
                        event.target.checked
                          ? [...current, pack.id]
                          : current.filter((id) => id !== pack.id),
                      );
                    }}
                    className="mt-1 h-4 w-4 accent-primary"
                  />
                  <span className="grid gap-1">
                    <span className="font-semibold">
                      {pack.name} — {formatColones(pack.price)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {pack.tags
                        .map((id) => paidTags.find((tag) => tag.id === id)?.name)
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {paidTags.map((tag) => (
                <CheckOption
                  key={tag.id}
                  label={`${tag.icon} ${tag.name} — ${formatColones(tagPrice)}`}
                  checked={selectedTagIds.has(tag.id)}
                  onChange={(checked) => toggleTag(tag.id, checked)}
                />
              ))}
            </div>
          </Section>

          <Section
            title="Servicios adicionales"
            description="Opcionales para darle más exposición a tu anuncio."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {addOnServices.map((service) => {
                const isSelected = selectedServices.includes(service.id);
                const isBoost = service.id === "boost-7-days" || service.id === "boost-30-days";

                return (
                  <label
                    key={service.id}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 hover:bg-muted/60"
                  >
                    <input
                      type={isBoost ? "radio" : "checkbox"}
                      name={isBoost ? "listing-boost" : undefined}
                      checked={isSelected}
                      onChange={(event) => toggleService(service.id, event.target.checked)}
                      className="mt-1 h-4 w-4 accent-primary"
                    />
                    <span className="grid gap-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-2 font-semibold">
                        {service.name}
                        <span className="font-extrabold text-primary">
                          {formatColones(service.price)}
                        </span>
                      </span>
                      <span className="text-sm text-muted-foreground">{service.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </Section>

          <Section title="Beneficios incluidos para todos">
            <ul className="grid gap-2 sm:grid-cols-2">
              {includedBenefits.map((benefit) => (
                <li key={benefit} className="flex gap-2 text-sm">
                  <span aria-hidden="true" className="text-primary">
                    ✓
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Estos beneficios y los servicios promocionales se activarán al habilitar la plataforma
              de pagos y la gestión de anuncios.
            </p>
          </Section>

          <Section title="Resumen estimado">
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt>{listingPlans.find((plan) => plan.id === selectedPlan)?.name}</dt>
                <dd className="font-semibold">
                  {formatColones(listingPlans.find((plan) => plan.id === selectedPlan)?.price ?? 0)}
                </dd>
              </div>
              {selectedPackOptions.map((pack) => (
                <div key={pack.id} className="flex justify-between gap-4">
                  <dt>{pack.name}</dt>
                  <dd className="font-semibold">{formatColones(pack.price)}</dd>
                </div>
              ))}
              {selectedTags
                .filter((tagId) => !selectedPackTags.has(tagId))
                .map((tagId) => {
                  const tag = paidTags.find((option) => option.id === tagId);
                  return tag ? (
                    <div key={tag.id} className="flex justify-between gap-4">
                      <dt>Etiqueta: {tag.name}</dt>
                      <dd className="font-semibold">{formatColones(tagPrice)}</dd>
                    </div>
                  ) : null;
                })}
              {selectedServices.map((serviceId) => {
                const service = addOnServices.find((option) => option.id === serviceId);
                return service ? (
                  <div key={service.id} className="flex justify-between gap-4">
                    <dt>{service.name}</dt>
                    <dd className="font-semibold">{formatColones(service.price)}</dd>
                  </div>
                ) : null;
              })}
              <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-extrabold">
                <dt>Total estimado por anuncio</dt>
                <dd>{formatColones(estimate)}</dd>
              </div>
              {selectedAgencyPlan && (
                <div className="flex justify-between gap-4 text-sm">
                  <dt>
                    Plan Agencia {agencyPlans.find((plan) => plan.id === selectedAgencyPlan)?.name}{" "}
                    (mensual)
                  </dt>
                  <dd className="font-semibold">
                    {formatColones(
                      agencyPlans.find((plan) => plan.id === selectedAgencyPlan)?.pricePerMonth ??
                        0,
                    )}{" "}
                    / mes
                  </dd>
                </div>
              )}
            </dl>
            <p className="mt-4 text-sm text-muted-foreground">
              Estimado informativo; no se procesan pagos en este momento.
            </p>
          </Section>

          <Section
            title="Información del vendedor"
            description="Estos datos se mostrarán para que te contacten directamente."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre (sin apellido)">
                <input
                  name="seller"
                  autoComplete="name"
                  placeholder="Solo tu nombre"
                  className={field}
                />
              </Field>
              <Field label="Correo electrónico">
                <input
                  name="seller_email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@correo.com"
                  className={field}
                />
              </Field>
              <Field label="Teléfono 1" required>
                <input
                  required
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{8}"
                  title="Ingresá un número de teléfono de 8 dígitos"
                  autoComplete="tel"
                  placeholder="8 dígitos"
                  className={field}
                />
              </Field>
              <Field label="Teléfono 2">
                <input
                  name="phone_2"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{8}"
                  placeholder="Opcional"
                  className={field}
                />
              </Field>
              <Field label="Teléfono 3">
                <input
                  name="phone_3"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{8}"
                  placeholder="Opcional"
                  className={field}
                />
              </Field>
              <Field label="WhatsApp del vendedor">
                <input
                  name="whatsapp_phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{8}"
                  placeholder="Opcional"
                  className={field}
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Imágenes"
            description={`Este plan permite hasta ${photoLimit} fotos. La primera será la principal; podés cambiarla antes de publicar.`}
          >
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={onPhotoDrop}
              className="rounded-xl border-2 border-dashed border-border bg-muted/40 p-5 text-center sm:p-8"
            >
              <label htmlFor="vehicle-photos" className="cursor-pointer">
                <span className="block font-semibold">Arrastrá y soltá tus fotos aquí</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  o seleccioná imágenes desde tu dispositivo
                </span>
              </label>
              <input
                ref={fileInput}
                id="vehicle-photos"
                required
                type="file"
                accept="image/*"
                multiple
                max={photoLimit}
                aria-describedby="photo-requirements"
                className="mx-auto mt-4 block max-w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-4 file:py-2 file:font-semibold file:text-secondary-foreground"
                onChange={onPhotoChange}
              />
              <p
                id="photo-requirements"
                aria-live="polite"
                className="mt-3 text-sm text-muted-foreground"
              >
                {photos.length === 0
                  ? `Mínimo 2 y máximo ${photoLimit} fotos.`
                  : `${photos.length} de ${photoLimit} fotos seleccionadas.`}
              </p>
              {photoError && photos.length > 0 && (
                <p role="alert" className="mt-2 text-sm font-semibold text-destructive">
                  {photoError}
                </p>
              )}
            </div>
            {photoPreviews.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {photoPreviews.map(({ file, url }, index) => (
                  <div
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="overflow-hidden rounded-xl border border-border bg-background"
                  >
                    <img
                      src={url}
                      alt={`Vista previa ${index + 1}: ${file.name}`}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="grid gap-2 p-2">
                      <label className="flex items-center gap-2 text-xs font-medium">
                        <input
                          type="radio"
                          name="main-photo"
                          checked={mainPhoto === index}
                          onChange={() => setMainPhoto(index)}
                          className="accent-primary"
                        />
                        Foto principal
                      </label>
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="text-left text-xs font-semibold text-destructive hover:underline"
                      >
                        Quitar foto
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              La fecha oficial se asignará al aprobar la publicación.
            </p>
          </Section>

          <div className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            El límite de fotos depende del plan seleccionado: 3 gratis, 6 Destacado, 10 Premium y
            hasta 10 adicionales con el servicio de fotografías extra. Los planes pagos se guardan
            como solicitud y requieren aprobación del plan antes de recibir prioridad.
          </div>
          {publishError && (
            <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
              {publishError}
            </p>
          )}
          {publishMessage && (
            <p role="status" className="rounded-xl bg-secondary p-4 text-sm">
              {publishMessage}{" "}
              {profile?.role !== "agency" && (
                <Link
                  to="/mis-vehiculos"
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  Consultar mis vehículos
                </Link>
              )}
            </p>
          )}
          <button
            type="submit"
            disabled={isPublishing || !isSupabaseConfigured || !user || Boolean(photoError)}
            className="w-full rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            {isPublishing ? "Guardando anuncio…" : "Enviar anuncio a revisión"}
          </button>
        </form>
      ) : activeAudience === "individual" ? (
        <section className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold">Panel de agencia</h2>
          <p className="mt-2 text-muted-foreground">
            La publicación de vehículos para agencias se administra desde tu panel.
          </p>
          <Link
            to="/dashboard/agencia"
            className="mt-5 inline-flex rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground"
          >
            Ir al Panel Agencia
          </Link>
        </section>
      ) : null}
    </main>
  );
}
