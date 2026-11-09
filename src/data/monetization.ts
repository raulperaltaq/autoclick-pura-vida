export type ListingPlanId = "free" | "featured" | "premium" | "premium-plus";

export const listingPlans = [
  {
    id: "free",
    name: "Publicación Gratuita",
    price: 0,
    photoLimit: 3,
    tagline: "Ideal para ventas sin prisa.",
    icon: "✅",
    features: [
      "Hasta 3 fotografías",
      "Duración de 30 días",
      "Requiere aprobación (1–2 horas)",
    ],
  },
  {
    id: "featured",
    name: "Destacado",
    price: 2475,
    photoLimit: 6,
    tagline: "Más visibilidad para tu vehículo.",
    icon: "⭐",
    features: [
      "Aparece por encima de anuncios gratuitos",
      'Etiqueta "Destacado"',
      "Hasta 6 fotografías",
      "Estadísticas de visitas",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 4070,
    photoLimit: 10,
    tagline: "Perfecto para vehículos de mayor valor.",
    icon: "🔥",
    features: [
      "Todo lo incluido en Destacado",
      "Primera página en resultados relacionados",
      "Etiqueta Premium",
      "Aparición en secciones recomendadas",
      "Prioridad en búsquedas",
      "Hasta 10 fotografías",
    ],
  },
  {
    id: "premium-plus",
    name: "Premium Plus",
    price: 6630,
    previousPrice: 7800,
    photoLimit: 10,
    tagline: "La mejor opción para vender rápidamente.",
    icon: "🚀",
    discountLabel: "15% de descuento",
    features: [
      "Todo lo incluido en Premium",
      "Publicación automática inmediata",
      "Difusión en redes sociales",
      "Etiqueta exclusiva Premium Plus",
      "Posición preferencial durante 45 días",
    ],
  },
] as const;

export const paidTags = [
  { id: "oferta", name: "Oferta", icon: "🔥" },
  { id: "negociable", name: "Negociable", icon: "💰" },
  { id: "poco-kilometraje", name: "Poco kilometraje", icon: "🚗" },
  { id: "full-extras", name: "Full extras", icon: "⭐" },
  { id: "record-agencia", name: "Récord de agencia", icon: "✅" },
  { id: "garantia", name: "Garantía incluida", icon: "🛡️" },
  { id: "recibo-vehiculo", name: "Recibo vehículo", icon: "🔄" },
  { id: "financio", name: "Financio", icon: "💳" },
  { id: "vendo-por-viaje", name: "Vendo por viaje", icon: "✈️" },
  { id: "urge-vender", name: "Urge vender", icon: "⚡" },
  { id: "un-solo-dueno", name: "Un solo dueño", icon: "👤" },
  { id: "edicion-limitada", name: "Edición limitada", icon: "🎯" },
  { id: "impecable", name: "Impecable", icon: "💎" },
  { id: "para-inscribir", name: "Para inscribir", icon: "📋" },
  { id: "llame-ya", name: "Llame ya", icon: "📞" },
] as const;

export const tagPrice = 325;

export const tagPacks = [
  {
    id: "quick-sale",
    name: "Pack Vendedor Rápido",
    price: 895,
    tags: ["urge-vender", "negociable", "oferta"],
  },
  {
    id: "premium-tags",
    name: "Pack Premium",
    price: 895,
    tags: ["full-extras", "impecable", "poco-kilometraje"],
  },
  {
    id: "financing",
    name: "Pack Financiamiento",
    price: 895,
    tags: ["financio", "recibo-vehiculo", "negociable"],
  },
  {
    id: "agency",
    name: "Pack Agencia",
    price: 895,
    tags: ["record-agencia", "garantia", "impecable"],
  },
] as const;

export const addOnServices = [
  { id: "extra-photos", name: "Fotografías Extra", price: 990, description: "Agrega hasta 10 fotografías adicionales." },
  { id: "social-promotion", name: "Promoción en Redes Sociales", price: 990, description: "Promoción en Facebook e Instagram Stories." },
  { id: "boost-7-days", name: "Impulso por 7 Días", price: 990, description: "Vuelve a subir el anuncio en los resultados." },
  { id: "boost-30-days", name: "Impulso por 30 Días", price: 1500, description: "Prioridad continua en las búsquedas." },
  { id: "verified-seal", name: "Sello de Vehículo Verificado", price: 1200, description: "Inspección documental e insignia de verificación." },
  { id: "priority-whatsapp", name: "Contacto Prioritario por WhatsApp", price: 990, description: "Botón de contacto directo al WhatsApp del vendedor." },
] as const;

export type AddOnId = (typeof addOnServices)[number]["id"];

export const agencyPlans = [
  {
    id: "starter",
    name: "Starter",
    pricePerMonth: 19500,
    description: "Ideal para agencias pequeñas y medianas.",
    features: [
      "30 publicaciones destacadas activas",
      'Etiqueta "Destacado"',
      "Hasta 6 fotografías por vehículo",
      "Prioridad sobre publicaciones gratuitas",
      "Estadísticas básicas",
      "Perfil de agencia",
    ],
  },
  {
    id: "deluxe",
    name: "Deluxe",
    pricePerMonth: 34500,
    description: "Diseñado para agencias con mayor inventario.",
    badge: "Más vendido ⭐",
    features: [
      "45 publicaciones Premium activas",
      'Etiqueta "Premium"',
      "Hasta 10 fotografías por vehículo",
      "Prioridad en búsquedas",
      "Aparición en vehículos recomendados",
      "Estadísticas avanzadas",
      "Perfil de agencia verificado",
      "Soporte prioritario",
    ],
  },
] as const;

export const includedBenefits = [
  "Publicación según el tiempo del plan seleccionado",
  "Panel para editar anuncios",
  "Estadísticas de visitas",
  "Contacto directo con el vendedor por teléfono o WhatsApp opcional",
  "Compartir en redes sociales",
  "Fotos en alta resolución",
] as const;

type EstimateInput = {
  plan: ListingPlanId;
  selectedTags: string[];
  selectedPacks: string[];
  selectedServices: string[];
};

export function calculateListingEstimate({
  plan,
  selectedTags,
  selectedPacks,
  selectedServices,
}: EstimateInput): number {
  const selectedPlan = listingPlans.find((item) => item.id === plan);
  const packChoices = tagPacks.filter((pack) => selectedPacks.includes(pack.id));
  const bundledTags = new Set<string>(packChoices.flatMap((pack) => pack.tags));
  const tagsNotCoveredByPacks = [...new Set(selectedTags)].filter((tag) => !bundledTags.has(tag));
  const selectedServicePrice = addOnServices
    .filter((service) => selectedServices.includes(service.id))
    .reduce((total, service) => total + service.price, 0);

  return (
    (selectedPlan?.price ?? 0) +
    packChoices.reduce((total, pack) => total + pack.price, 0) +
    tagsNotCoveredByPacks.length * tagPrice +
    selectedServicePrice
  );
}

export function getPhotoLimit(plan: ListingPlanId, extraPhotos: boolean): number {
  const selectedPlan = listingPlans.find((item) => item.id === plan);
  const limit = (selectedPlan?.photoLimit ?? 3) + (extraPhotos ? 10 : 0);
  return Math.min(limit, 20);
}
