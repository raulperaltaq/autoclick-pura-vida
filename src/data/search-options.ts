import { sortListingsByPlanPriority, type Listing } from "@/data/listings";

export const brands =
  "Acura|Aion|Alfa Romeo|AMC|Aro|Asia|Aston Martin|Audi|Austin|BAIC|0Baw|Bentley|0Bluebird|BMW|Brilliance|Buick|BYD|Cadillac|0Chana|0Changan|Chery|Chevrolet|Chrysler|Citroen|CMC|Dacia|Daewoo|0Daihatsu|Datsun|Dodge/RAM|Donfeng (ZNA)|Eagle|0Faw|Ferrari|Fiat|Ford|Foton|Freightliner|Geely|Genesis|Geo|GMC|Gonow|Great Wall|0Hafei|Haima|Haval|0Heibao|Higer|Hino|Honda|Hummer|Hycan|Hyundai|Infiniti|0International|Isuzu|Iveco|JAC|0Jaecoo|Jaguar|Jeep|Jetour|Jinbei|JMC|Jonway|Kaiyi|0Kenworth|Kia|Lada|Lamborghini|Lancia|Land Rover|Lexus|Lifan|Lincoln|Lotus|0Mack|Magiruz|Mahindra|0Marcopolo|Maserati|Maxus|Mazda|Mercedes Benz|Mercury|MG|Mini|Mitsubishi|Neta|Nissan|Oldsmobile|Omoda|0Opel|0Peterbilt|Peugeot|Piaggio|Plymouth|00Polarsun|Pontiac|Porsche|Proton|0Rambler|0Renault|0Reva|Rivian|Rolls Royce|Rover|Saab|Samsung|Saturn|Scania|Scion|Seat|Shineray|Skoda|Smart|Soueast|Ssang Yong|Subaru|Suzuki|Tesla|Tianma|Tiger Truck|Toyota|VGV|Volkswagen|Volvo|0Western Star|Xiaomi|Xpeng|Yugo|Zap|Zeekr|0Zotye".split(
    "|",
  );

export const styles = [
  "Sedán",
  "Station Wagon",
  "Hatchback",
  "Pick Up 2WD",
  "Pick Up 4WD",
  "Pánel",
  "Microbús/Minivan",
  "SUV 2WD",
  "SUV 4WD/AWD",
  "Casa Rodante",
  "Comercial 1.0-3.5 Ton.",
  "Comercial 4.0-4.5 Ton.",
  "Comercial 5.0-7.5 Ton.",
  "Comercial 8.0-9.5 Ton.",
  "Comercial 10.0+ Ton.",
];

export type Filters = {
  q?: string;
  make?: string;
  model?: string;
  year?: string;
  condition?: string;
  style?: string;
  fuel?: string;
  transmission?: string;
  financing?: string;
  trade?: string;
  province?: string;
  doors?: string;
  sort?: string;
};

export const MAX_SEARCH_RESULTS = 10;

const str = (v: unknown) =>
  typeof v === "string" ? v : typeof v === "number" ? String(v) : undefined;
export const parseFilters = (s: Record<string, unknown>): Filters =>
  Object.fromEntries(
    [
      "q",
      "make",
      "model",
      "year",
      "condition",
      "style",
      "fuel",
      "transmission",
      "financing",
      "trade",
      "province",
      "doors",
      "sort",
    ].flatMap((key) => {
      const value = str(s[key]);
      return value === undefined ? [] : [[key, value]];
    }),
  );

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function applyFilters(all: Listing[], f: Filters) {
  const words = norm(f.q ?? "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !["en", "de", "con", "un", "una"].includes(w));
  const minYear = Number(f.year) || 0;
  const r = all.filter((l) => {
    const hay = norm(
      `${l.make} ${l.model} ${l.year} ${l.fuel} ${l.style} ${l.province} ${l.transmission}`,
    );
    if (!words.every((w) => hay.includes(w))) return false;
    if (f.make && l.make !== f.make) return false;
    if (f.model && !norm(l.model).includes(norm(f.model))) return false;
    if (minYear && l.year < minYear) return false;
    if (f.condition && l.condition !== f.condition) return false;
    if (f.style && l.style !== f.style) return false;
    if (f.fuel && norm(l.fuel) !== norm(f.fuel)) return false;
    if (f.transmission && l.transmission !== f.transmission) return false;
    if (f.financing === "si" && !l.financing) return false;
    if (f.trade === "si" && !l.trade) return false;
    if (f.province && l.province !== f.province) return false;
    if (f.doors && l.doors === null) return false;
    if (f.doors === "2-3" && l.doors !== null && l.doors > 3) return false;
    if (f.doors === "4+" && l.doors !== null && l.doors < 4) return false;
    return true;
  });
  const by: Record<string, (a: Listing, b: Listing) => number> = {
    price: (a, b) => a.price - b.price,
    year: (a, b) => b.year - a.year,
    make: (a, b) => a.make.localeCompare(b.make),
    model: (a, b) => a.model.localeCompare(b.model),
  };
  return sortListingsByPlanPriority(r, by[f.sort ?? "price"] ?? by["price"]);
}
