import car1 from "@/assets/car-1.jpg";
import car2 from "@/assets/car-2.jpg";
import car3 from "@/assets/car-3.jpg";

export type Listing = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  marketPrice: number;
  km: number;
  fuel: "Gasolina" | "Diésel" | "Híbrido" | "Eléctrico";
  transmission: "Automática" | "Manual";
  body: "SUV" | "Pickup" | "Sedán" | "Hatchback";
  province: string;
  style: string;
  condition: "Nuevo" | "Usado";
  doors: number;
  financing: boolean;
  trade: boolean;
  image: string;
  verified: boolean;
  featured: boolean;
  seller: string;
  phone: string;
  description: string;
};

const base: Listing[] = [
  { id: "rav4-2022", make: "Toyota", model: "RAV4 Híbrido", year: 2022, price: 24500000, marketPrice: 25800000, km: 38000, fuel: "Híbrido", transmission: "Automática", body: "SUV", province: "San José", style: "SUV 4WD/AWD", condition: "Usado", doors: 5, financing: true, trade: false, image: car1, verified: true, featured: true, seller: "Autos Escazú", phone: "50688887777", description: "Único dueño, mantenimientos en agencia, marchamo al día y RTV vigente. Llantas nuevas." },
  { id: "tucson-2020", make: "Hyundai", model: "Tucson", year: 2020, price: 15900000, marketPrice: 15500000, km: 61000, fuel: "Gasolina", transmission: "Automática", body: "SUV", province: "Heredia", style: "SUV 2WD", condition: "Usado", doors: 5, financing: false, trade: true, image: car2, verified: true, featured: false, seller: "María R.", phone: "50687776666", description: "Muy cuidado, sin choques, cámara de retroceso y Apple CarPlay. Se recibe vehículo de menor valor." },
  { id: "hilux-2021", make: "Toyota", model: "Hilux 4x4", year: 2021, price: 27900000, marketPrice: 29000000, km: 52000, fuel: "Diésel", transmission: "Manual", body: "Pickup", province: "Alajuela", style: "Pick Up 4WD", condition: "Usado", doors: 4, financing: true, trade: true, image: car3, verified: true, featured: true, seller: "Pickups del Valle", phone: "50686665555", description: "Doble cabina, 4x4, cobertor de cajón y estribos. Ideal para trabajo y finca." },
  { id: "rav4-2019", make: "Toyota", model: "RAV4", year: 2019, price: 17800000, marketPrice: 17400000, km: 84000, fuel: "Gasolina", transmission: "Automática", body: "SUV", province: "Cartago", style: "SUV 2WD", condition: "Usado", doors: 5, financing: false, trade: false, image: car1, verified: false, featured: false, seller: "José M.", phone: "50685554444", description: "Papeles en regla, recién pintado el bumper delantero. Precio negociable." },
  { id: "tucson-2023", make: "Hyundai", model: "Tucson Limited", year: 2023, price: 22300000, marketPrice: 23100000, km: 18000, fuel: "Híbrido", transmission: "Automática", body: "SUV", province: "Guanacaste", style: "SUV 4WD/AWD", condition: "Nuevo", doors: 5, financing: true, trade: false, image: car2, verified: true, featured: false, seller: "Hyundai Liberia Seminuevos", phone: "50684443333", description: "Garantía de fábrica vigente, techo panorámico y asientos de cuero." },
  { id: "hilux-2017", make: "Toyota", model: "Hilux SR", year: 2017, price: 16500000, marketPrice: 16900000, km: 132000, fuel: "Diésel", transmission: "Manual", body: "Pickup", province: "Puntarenas", style: "Pick Up 2WD", condition: "Usado", doors: 2, financing: false, trade: true, image: car3, verified: false, featured: false, seller: "Carlos V.", phone: "50683332222", description: "Motor impecable, uso familiar. Se entrega con marchamo pagado." },
];

export const listings = base;

export const formatCRC = (n: number) =>
  new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 }).format(n);

export const priceTag = (l: Listing) => {
  const diff = (l.price - l.marketPrice) / l.marketPrice;
  if (diff <= -0.03) return { label: "Buen precio", tone: "good" as const };
  if (diff >= 0.03) return { label: "Sobre mercado", tone: "high" as const };
  return { label: "Precio justo", tone: "fair" as const };
};

export const provinces = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"];
