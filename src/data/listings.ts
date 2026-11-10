import car1 from "@/assets/car-1.jpg";
import car2 from "@/assets/car-2.jpg";
import car3 from "@/assets/car-3.jpg";
import type { ListingPlanId } from "@/data/monetization";

export type Listing = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: "CRC" | "USD";
  km: number | null;
  fuel: "Gasolina" | "Diésel" | "Híbrido" | "Eléctrico";
  transmission: "Automática" | "Manual" | "CVT" | "Doble embrague";
  body: "SUV" | "Pickup" | "Sedán" | "Hatchback";
  province: string;
  style: string;
  condition: "Nuevo" | "Usado";
  doors: number | null;
  financing: boolean | null;
  trade: boolean | null;
  image: string;
  images: string[];
  plan: ListingPlanId;
  publishedAt: string;
  seller: string;
  phone: string;
  description: string;
  details: Record<string, string | string[]>;
  whatsappEnabled: boolean;
};

const optionalDetailLabels: Record<string, string> = {
  engine_cc: "Cilindrada",
  passengers: "Pasajeros",
  negotiable: "Precio negociable",
  exterior_color: "Color exterior",
  interior_color: "Color interior",
  autonomy_km: "Autonomía",
  battery_kwh: "Capacidad de batería",
  taxes_paid: "Impuestos pagados",
  plate: "Placa",
  canton: "Cantón",
  previous_owners: "Dueños anteriores",
  average_consumption: "Consumo promedio",
  battery_condition: "Estado de la batería",
  warranty: "Garantía",
  seller_type: "Tipo de vendedor",
  youtube_url: "Video",
  maintenance_history: "Historial de mantenimiento",
  extras: "Equipamiento",
};

export function getListingSellerFirstName(seller: string): string {
  return seller.trim().split(/\s+/)[0] ?? "";
}

export function getListingOptionalDetails(
  details: Record<string, string | string[]>,
): Array<{ label: string; value: string }> {
  return Object.entries(details).flatMap(([key, rawValue]) => {
    const label = optionalDetailLabels[key];
    if (!label) return [];
    const values = (Array.isArray(rawValue) ? rawValue : [rawValue])
      .map((value) => value.trim())
      .filter(Boolean);
    if (!values.length) return [];
    return [{ label, value: values.join(", ") }];
  });
}

const listingPlanPriority: Record<ListingPlanId, number> = {
  "premium-plus": 0,
  premium: 1,
  featured: 2,
  free: 3,
};

export function sortListingsByPlanPriority(
  listings: Listing[],
  compareWithinPlan?: (a: Listing, b: Listing) => number,
): Listing[] {
  return [...listings].sort(
    (a, b) =>
      listingPlanPriority[a.plan] - listingPlanPriority[b.plan] || compareWithinPlan?.(a, b) || 0,
  );
}

export function sortListingsByPublishDate(listings: Listing[]): Listing[] {
  return [...listings].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

const base: Listing[] = [
  {
    id: "rav4-2022",
    make: "Toyota",
    model: "RAV4 Híbrido",
    year: 2022,
    price: 24500000,
    currency: "CRC",
    km: 38000,
    fuel: "Híbrido",
    transmission: "Automática",
    body: "SUV",
    province: "San José",
    style: "SUV 4WD/AWD",
    condition: "Usado",
    doors: 5,
    financing: true,
    trade: false,
    image: car1,
    images: [car1],
    plan: "premium-plus",
    publishedAt: "2025-02-20T14:00:00.000Z",
    seller: "Autos Escazú",
    phone: "50688887777",
    description:
      "Único dueño, mantenimientos en agencia, marchamo al día y RTV vigente. Llantas nuevas.",
    details: {},
    whatsappEnabled: false,
  },
  {
    id: "tucson-2020",
    make: "Hyundai",
    model: "Tucson",
    year: 2020,
    price: 15900000,
    currency: "CRC",
    km: 61000,
    fuel: "Gasolina",
    transmission: "Automática",
    body: "SUV",
    province: "Heredia",
    style: "SUV 2WD",
    condition: "Usado",
    doors: 5,
    financing: false,
    trade: true,
    image: car2,
    images: [car2],
    plan: "free",
    publishedAt: "2025-02-24T14:00:00.000Z",
    seller: "María R.",
    phone: "50687776666",
    description:
      "Muy cuidado, sin choques, cámara de retroceso y Apple CarPlay. Se recibe vehículo de menor valor.",
    details: {},
    whatsappEnabled: false,
  },
  {
    id: "hilux-2021",
    make: "Toyota",
    model: "Hilux 4x4",
    year: 2021,
    price: 27900000,
    currency: "CRC",
    km: 52000,
    fuel: "Diésel",
    transmission: "Manual",
    body: "Pickup",
    province: "Alajuela",
    style: "Pick Up 4WD",
    condition: "Usado",
    doors: 4,
    financing: true,
    trade: true,
    image: car3,
    images: [car3],
    plan: "premium",
    publishedAt: "2025-02-22T14:00:00.000Z",
    seller: "Pickups del Valle",
    phone: "50686665555",
    description: "Doble cabina, 4x4, cobertor de cajón y estribos. Ideal para trabajo y finca.",
    details: {},
    whatsappEnabled: false,
  },
  {
    id: "rav4-2019",
    make: "Toyota",
    model: "RAV4",
    year: 2019,
    price: 17800000,
    currency: "CRC",
    km: 84000,
    fuel: "Gasolina",
    transmission: "Automática",
    body: "SUV",
    province: "Cartago",
    style: "SUV 2WD",
    condition: "Usado",
    doors: 5,
    financing: false,
    trade: false,
    image: car1,
    images: [car1],
    plan: "free",
    publishedAt: "2025-02-21T14:00:00.000Z",
    seller: "José M.",
    phone: "50685554444",
    description: "Papeles en regla, recién pintado el bumper delantero. Precio negociable.",
    details: {},
    whatsappEnabled: false,
  },
  {
    id: "tucson-2023",
    make: "Hyundai",
    model: "Tucson Limited",
    year: 2023,
    price: 22300000,
    currency: "CRC",
    km: 18000,
    fuel: "Híbrido",
    transmission: "Automática",
    body: "SUV",
    province: "Guanacaste",
    style: "SUV 4WD/AWD",
    condition: "Nuevo",
    doors: 5,
    financing: true,
    trade: false,
    image: car2,
    images: [car2],
    plan: "featured",
    publishedAt: "2025-02-23T14:00:00.000Z",
    seller: "Hyundai Liberia Seminuevos",
    phone: "50684443333",
    description: "Garantía de fábrica vigente, techo panorámico y asientos de cuero.",
    details: {},
    whatsappEnabled: false,
  },
  {
    id: "hilux-2017",
    make: "Toyota",
    model: "Hilux SR",
    year: 2017,
    price: 16500000,
    currency: "CRC",
    km: 132000,
    fuel: "Diésel",
    transmission: "Manual",
    body: "Pickup",
    province: "Puntarenas",
    style: "Pick Up 2WD",
    condition: "Usado",
    doors: 2,
    financing: false,
    trade: true,
    image: car3,
    images: [car3],
    plan: "free",
    publishedAt: "2025-02-25T14:00:00.000Z",
    seller: "Carlos V.",
    phone: "50683332222",
    description: "Motor impecable, uso familiar. Se entrega con marchamo pagado.",
    details: {},
    whatsappEnabled: false,
  },
];

export const listings = base;

export const formatCRC = (n: number) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(n);

export const formatListingPrice = (listing: Pick<Listing, "price" | "currency">) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: listing.currency,
    maximumFractionDigits: 0,
  }).format(listing.price);

export const provinces = [
  "San José",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limón",
];
