import type { Listing } from "@/data/listings";

export const brands = "Acura|Aion|Alfa Romeo|AMC|Aro|Asia|Aston Martin|Audi|Austin|BAIC|Baw|Bentley|Bluebird|BMW|Brilliance|Buick|BYD|Cadillac|Chana|Changan|Chery|Chevrolet|Chrysler|Citroen|CMC|Dacia|Daewoo|Daihatsu|Datsun|Dodge/RAM|Donfeng (ZNA)|Eagle|Faw|Ferrari|Fiat|Ford|Foton|Freightliner|Geely|Genesis|Geo|GMC|Gonow|Great Wall|Hafei|Haima|Haval|Heibao|Higer|Hino|Honda|Hummer|Hycan|Hyundai|Infiniti|International|Isuzu|Iveco|JAC|Jaecoo|Jaguar|Jeep|Jetour|Jinbei|JMC|Jonway|Kaiyi|Kenworth|Kia|Lada|Lamborghini|Lancia|Land Rover|Lexus|Lifan|Lincoln|Lotus|Mack|Magiruz|Mahindra|Marcopolo|Maserati|Maxus|Mazda|Mercedes Benz|Mercury|MG|Mini|Mitsubishi|Neta|Nissan|Oldsmobile|Omoda|Opel|Peterbilt|Peugeot|Piaggio|Plymouth|Polarsun|Pontiac|Porsche|Proton|Rambler|Renault|Reva|Rivian|Rolls Royce|Rover|Saab|Samsung|Saturn|Scania|Scion|Seat|Shineray|Skoda|Smart|Soueast|Ssang Yong|Subaru|Suzuki|Tesla|Tianma|Tiger Truck|Toyota|VGV|Volkswagen|Volvo|Western Star|Xiaomi|Xpeng|Yugo|Zap|Zeekr|Zotye".split("|");

export const styles = ["Sedán", "Station Wagon", "Hatchback", "Pick Up 2WD", "Pick Up 4WD", "Pánel", "Microbús/Minivan", "SUV 2WD", "SUV 4WD/AWD", "Casa Rodante", "Comercial 1.0-3.5 Ton.", "Comercial 4.0-4.5 Ton.", "Comercial 5.0-7.5 Ton.", "Comercial 8.0-9.5 Ton.", "Comercial 10.0+ Ton."];

export type Filters = {
  q?: string; make?: string; model?: string; year?: string; condition?: string; style?: string;
  fuel?: string; transmission?: string; financing?: string; trade?: string; province?: string;
  doors?: string; sort?: string;
};

const str = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : undefined);
export const parseFilters = (s: Record<string, unknown>): Filters => ({
  q: str(s.q), make: str(s.make), model: str(s.model), year: str(s.year), condition: str(s.condition),
  style: str(s.style), fuel: str(s.fuel), transmission: str(s.transmission), financing: str(s.financing),
  trade: str(s.trade), province: str(s.province), doors: str(s.doors), sort: str(s.sort),
});

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function applyFilters(all: Listing[], f: Filters) {
  const words = norm(f.q ?? "").split(/\s+/).filter((w) => w.length > 1 && !["en", "de", "con", "un", "una"].includes(w));
  const minYear = Number(f.year) || 0;
  let r = all.filter((l) => {
    const hay = norm(`${l.make} ${l.model} ${l.year} ${l.fuel} ${l.style} ${l.province} ${l.transmission}`);
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
    if (f.doors === "2-3" && l.doors > 3) return false;
    if (f.doors === "4+" && l.doors < 4) return false;
    return true;
  });
  const by: Record<string, (a: Listing, b: Listing) => number> = {
    price: (a, b) => a.price - b.price,
    year: (a, b) => b.year - a.year,
    make: (a, b) => a.make.localeCompare(b.make),
    model: (a, b) => a.model.localeCompare(b.model),
  };
  if (f.sort && by[f.sort]) r = [...r].sort(by[f.sort]);
  else r = [...r].sort((a, b) => Number(b.featured) - Number(a.featured));
  return r;
}
