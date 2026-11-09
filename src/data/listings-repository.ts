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

export type ListingSubmission = Omit<Listing, "id" | "image" | "plan" | "publishedAt"> & {
  requestedPlan: ListingPlanId;
  details: Record<string, string | string[]>;
  photos: File[];
  mainPhotoIndex: number;
  extraPhotos: boolean;
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

function requiredBoolean(record: Record<string, unknown>, key: string): boolean {
  const value = record[key];
  if (typeof value !== "boolean") {
    throw new Error(`Invalid listing data: ${key} must be a boolean.`);
  }
  return value;
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
    km: requiredNumber(value, "km"),
    fuel: requiredChoice(value, "fuel", fuels),
    transmission: requiredChoice(value, "transmission", transmissions),
    body: requiredChoice(value, "body", bodies),
    province: requiredString(value, "province"),
    style: requiredString(value, "style"),
    condition: requiredChoice(value, "condition", conditions),
    doors: requiredNumber(value, "doors"),
    financing: requiredBoolean(value, "financing"),
    trade: requiredBoolean(value, "trade"),
    image: requiredString(value, "image_url"),
    plan: requiredChoice(value, "plan", plans),
    publishedAt,
    seller: requiredString(value, "seller"),
    phone: requiredString(value, "phone"),
    description: requiredString(value, "description"),
  };
}

export async function fetchListings(): Promise<Listing[]> {
  if (!supabase) return listings;

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, make, model, year, price, currency, km, fuel, transmission, body, province, style, condition, doors, financing, trade, image_url, plan, published_at, seller, phone, description",
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
  if (!input.make.trim() || !input.model.trim() || !input.seller.trim()) {
    throw new Error("Completá la marca, el modelo y el nombre del vendedor.");
  }
  if (!Number.isInteger(input.year) || input.year < 1900 || input.price <= 0 || input.km < 0) {
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
    throw new Error("No se pudo guardar el anuncio. Verificá la conexión e intentá nuevamente.");
  }
}
