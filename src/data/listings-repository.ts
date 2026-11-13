import { listings, type Listing } from "@/data/listings";
import { getPhotoLimit } from "@/data/monetization";
import type { ListingPlanId } from "@/data/monetization";
import { supabase } from "@/lib/supabase";

const plans = new Set<ListingPlanId>(["free", "featured", "premium", "premium-plus"]);
const currencies = new Set<Listing["currency"]>(["CRC", "USD"]);
const fuels = new Set<Listing["fuel"]>(["Gasolina", "Diésel", "Híbrido", "Eléctrico"]);
const transmissions = new Set<Listing["transmission"]>([
  "Automática",
  "Manual",
  "CVT",
  "Doble embrague",
]);
const bodies = new Set<Listing["body"]>(["SUV", "Pickup", "Sedán", "Hatchback"]);
const conditions = new Set<Listing["condition"]>(["Nuevo", "Usado"]);
const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export type ListingSubmission = Omit<
  Listing,
  "id" | "image" | "images" | "plan" | "publishedAt" | "details" | "whatsappEnabled"
> & {
  requestedPlan: ListingPlanId;
  details: Record<string, string | string[]>;
  photos: File[];
  mainPhotoIndex: number;
  extraPhotos: boolean;
};

export type OwnedListing = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: Listing["currency"];
  status: string;
  image: string;
  publishedAt: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Invalid listing data: ${key} must be a non-empty string.`);
  }
  return value;
}

function requiredNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Invalid listing data: ${key} must be a finite number.`);
  }
  return value;
}

function optionalBoolean(record: Record<string, unknown>, key: string): boolean | null {
  const value = record[key];
  if (value === null || value === undefined) return null;
  if (typeof value !== "boolean")
    throw new Error(`Invalid listing data: ${key} must be a boolean.`);
  return value;
}

function optionalNumber(record: Record<string, unknown>, key: string): number | null {
  const value = record[key];
  if (value === null || value === undefined) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Invalid listing data: ${key} must be a finite number.`);
  }
  return value;
}

function optionalString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (value === null || value === undefined) return "";
  if (typeof value !== "string") throw new Error(`Invalid listing data: ${key} must be a string.`);
  return value;
}

function getPublicationErrorMessage(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error && typeof error.message === "string"
        ? error.message
        : "";

  if (/row-level security|permission denied|not authorized|new row violates/i.test(message)) {
    return "No tenés permiso para guardar este anuncio. Verificá que tu cuenta tenga permiso para subir imágenes y crear sus propios anuncios.";
  }
  if (/bucket.*(?:not found|does not exist)|(?:not found|does not exist).*bucket/i.test(message)) {
    return "No está configurado el almacenamiento de imágenes. Intentá nuevamente cuando esté habilitado.";
  }
  if (/column|schema cache|requested_plan|pending_review/i.test(message)) {
    return "La configuración de publicaciones necesita una actualización. Intentá nuevamente en unos minutos.";
  }

  return "No se pudo guardar el anuncio. Verificá la conexión e intentá nuevamente.";
}

function optionalDetails(value: unknown): Record<string, string | string[]> {
  if (!isRecord(value)) return {};
  const details: Record<string, string | string[]> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string") details[key] = item;
    else if (Array.isArray(item) && item.every((entry) => typeof entry === "string")) {
      details[key] = item;
    }
  }
  return details;
}

function requiredChoice<T extends string>(
  record: Record<string, unknown>,
  key: string,
  choices: Set<T>,
): T {
  const value = record[key];
  if (typeof value !== "string") {
    throw new Error(`Invalid listing data: ${key} has an unsupported value.`);
  }
  for (const choice of choices) {
    if (choice === value) return choice;
  }
  throw new Error(`Invalid listing data: ${key} has an unsupported value.`);
}

function toListing(value: unknown): Listing {
  if (!isRecord(value)) {
    throw new Error("Invalid listing data: each row must be an object.");
  }

  const publishedAt = requiredString(value, "published_at");
  if (!Number.isFinite(Date.parse(publishedAt))) {
    throw new Error("Invalid listing data: published_at must be a valid timestamp.");
  }

  return {
    id: requiredString(value, "id"),
    make: requiredString(value, "make"),
    model: requiredString(value, "model"),
    year: requiredNumber(value, "year"),
    price: requiredNumber(value, "price"),
    currency: requiredChoice(value, "currency", currencies),
    km: optionalNumber(value, "km"),
    fuel: requiredChoice(value, "fuel", fuels),
    transmission: requiredChoice(value, "transmission", transmissions),
    body: requiredChoice(value, "body", bodies),
    province: requiredString(value, "province"),
    style: requiredString(value, "style"),
    condition: requiredChoice(value, "condition", conditions),
    doors: optionalNumber(value, "doors"),
    financing: optionalBoolean(value, "financing"),
    trade: optionalBoolean(value, "trade"),
    image: requiredString(value, "image_url"),
    images:
      Array.isArray(value["image_urls"]) &&
      value["image_urls"].length > 0 &&
      value["image_urls"].every(
        (image): image is string => typeof image === "string" && image.trim().length > 0,
      )
        ? value["image_urls"]
        : [requiredString(value, "image_url")],
    plan: requiredChoice(value, "plan", plans),
    publishedAt,
    seller: optionalString(value, "seller"),
    phone: requiredString(value, "phone"),
    description: optionalString(value, "description"),
    details: optionalDetails(value["details"]),
    whatsappEnabled: value["whatsapp_enabled"] === true,
  };
}

function toOwnedListing(value: unknown): OwnedListing {
  if (!isRecord(value)) {
    throw new Error("Invalid owned listing data: each row must be an object.");
  }

  const currency = requiredChoice(value, "currency", currencies);
  const status = requiredString(value, "status");
  const publishedAt = optionalString(value, "published_at");
  if (publishedAt && !Number.isFinite(Date.parse(publishedAt))) {
    throw new Error("Invalid owned listing data: published_at must be a valid timestamp.");
  }

  return {
    id: requiredString(value, "id"),
    make: requiredString(value, "make"),
    model: requiredString(value, "model"),
    year: requiredNumber(value, "year"),
    price: requiredNumber(value, "price"),
    currency,
    status,
    image: optionalString(value, "image_url"),
    publishedAt: publishedAt || null,
  };
}

export async function fetchListings(): Promise<Listing[]> {
  if (!supabase) return listings;

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, make, model, year, price, currency, km, fuel, transmission, body, province, style, condition, doors, financing, trade, image_url, image_urls, plan, published_at, seller, phone, description, details, whatsapp_enabled",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Could not load vehicle listings from Supabase:", error);
    throw new Error("No se pudieron cargar los vehículos publicados. Intentá nuevamente.");
  }

  if (!data?.length) return listings;
  return data.map(toListing);
}

export async function fetchOwnedListings(ownerId: string): Promise<OwnedListing[]> {
  if (!supabase) {
    throw new Error(
      "La gestión de vehículos no está configurada. Conectá Supabase e intentá nuevamente.",
    );
  }
  if (!ownerId) throw new Error("Iniciá sesión para consultar tus vehículos.");

  const { data, error } = await supabase
    .from("listings")
    .select("id, make, model, year, price, currency, status, image_url, published_at")
    .eq("owner_id", ownerId)
    .order("published_at", { ascending: false, nullsFirst: true });

  if (error) {
    console.error("Could not load the authenticated user's vehicle listings:", error);
    throw new Error("No se pudieron cargar tus vehículos. Intentá nuevamente.");
  }

  return (data ?? []).map(toOwnedListing);
}

export async function publishListing(input: ListingSubmission): Promise<void> {
  if (!supabase) {
    throw new Error("La publicación no está configurada. Conectá Supabase e intentá nuevamente.");
  }
  if (
    input.photos.length < 2 ||
    input.photos.length > getPhotoLimit(input.requestedPlan, input.extraPhotos)
  ) {
    throw new Error("La cantidad de fotografías no coincide con el plan seleccionado.");
  }
  if (!input.make.trim() || !input.model.trim()) {
    throw new Error("Completá la marca y el modelo del vehículo.");
  }
  if (
    !Number.isInteger(input.year) ||
    input.year < 1900 ||
    input.price <= 0 ||
    (input.km !== null && input.km < 0)
  ) {
    throw new Error("Revisá el año, el precio y el kilometraje del vehículo.");
  }
  if (!/^506\d{8}$/.test(input.phone)) {
    throw new Error("Ingresá un teléfono de Costa Rica válido.");
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error("No se pudo verificar tu sesión. Iniciá sesión nuevamente.");
  if (!authData.user) throw new Error("Iniciá sesión para publicar un vehículo.");

  for (const photo of input.photos) {
    if (!supportedImageTypes.has(photo.type)) {
      throw new Error("Usá imágenes JPG, PNG, WebP o AVIF.");
    }
    if (photo.size > 10 * 1024 * 1024) {
      throw new Error("Cada imagen debe pesar 10 MB o menos.");
    }
  }

  const listingId = crypto.randomUUID();
  const mainPhoto = input.photos[input.mainPhotoIndex];
  if (!mainPhoto) throw new Error("Seleccioná una fotografía principal válida.");
  const orderedPhotos = [mainPhoto, ...input.photos.filter((photo) => photo !== mainPhoto)];
  const uploadedPaths: string[] = [];

  try {
    const imageUrls: string[] = [];
    for (const [index, photo] of orderedPhotos.entries()) {
      const extension = photo.type.split("/")[1];
      const path = `${authData.user.id}/${listingId}/${index + 1}-${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("listing-images")
        .upload(path, photo, { contentType: photo.type, upsert: false });
      if (error) throw error;
      uploadedPaths.push(path);
      imageUrls.push(supabase.storage.from("listing-images").getPublicUrl(path).data.publicUrl);
    }

    const { error } = await supabase.from("listings").insert({
      id: listingId,
      owner_id: authData.user.id,
      make: input.make,
      model: input.model,
      year: input.year,
      price: input.price,
      currency: input.currency,
      km: input.km,
      fuel: input.fuel,
      transmission: input.transmission,
      body: input.body,
      province: input.province,
      style: input.style,
      condition: input.condition,
      doors: input.doors,
      financing: input.financing,
      trade: input.trade,
      image_url: imageUrls[0],
      image_urls: imageUrls,
      seller: input.seller,
      phone: input.phone,
      description: input.description,
      whatsapp_enabled: false,
      plan: "free",
      requested_plan: input.requestedPlan,
      published_at: null,
      status: "pending_review",
      details: input.details,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Could not publish vehicle listing:", error);
    if (uploadedPaths.length > 0) {
      const { error: cleanupError } = await supabase.storage
        .from("listing-images")
        .remove(uploadedPaths);
      if (cleanupError) {
        console.error("Could not remove images from the failed listing submission:", cleanupError);
      }
    }
    throw new Error(getPublicationErrorMessage(error));
  }
}
