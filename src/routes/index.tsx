import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Users, Phone, Sparkles } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { listings } from "@/data/listings";
import { ListingCard } from "@/components/listing-card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "autoclick.cr — Compra y vende vehículos en Costa Rica" },
      { name: "description", content: "Encuentra tu próximo carro en Costa Rica con anuncios publicados directamente por sus vendedores." },
      { property: "og:title", content: "autoclick.cr — Vehículos en Costa Rica" },
      { property: "og:description", content: "Anuncios publicados directamente por vendedores en Costa Rica." },
    ],
  }),
  component: Index,
});

const benefits = [
  { icon: Users, title: "Anuncios de la comunidad", text: "Cada vendedor publica y mantiene su propio anuncio." },
  { icon: Phone, title: "Contacto directo", text: "Coordiná la visita directamente con quien publicó el vehículo." },
  { icon: Search, title: "Elegí con información", text: "Revisá los detalles del anuncio antes de contactar al vendedor." },
];

function Index() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  return (
    <main>
      <section className="relative isolate overflow-hidden">
        <img src={hero} alt="SUV en carretera de montaña en Costa Rica" width={1600} height={912} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-hero-fade" />
        <div className="mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <p className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Buscá con una frase
          </p>
          <h1 className="mt-5 max-w-2xl text-5xl font-extrabold leading-[1.02] text-ink-foreground sm:text-7xl">
            Tu próximo carro, a un click.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-ink-foreground/80">
            Comprá o vendé tu vehículo en Costa Rica directamente entre personas.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/autos", search: { q } });
            }}
            className="mt-8 flex max-w-xl items-center gap-2 rounded-full bg-card p-2 shadow-card"
          >
            <Search className="ml-3 h-5 w-5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ej: Toyota híbrido en San José"
              className="min-w-0 flex-1 bg-transparent py-2 text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" className="rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:bg-primary/90">Buscar</button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Destacados de la semana</h2>
          <Link to="/autos" search={{ q: "" }} className="text-sm font-semibold text-primary">Ver todos →</Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.slice(0, 3).map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 rounded-3xl bg-secondary p-8 sm:grid-cols-3 sm:p-12">
          {benefits.map((b) => (
            <div key={b.title}>
              <b.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-3 text-xl font-bold">{b.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-ink p-10 text-ink-foreground sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-extrabold">¿Vendés tu carro?</h2>
            <p className="mt-2 opacity-75">Publicalo gratis en menos de 2 minutos desde tu teléfono.</p>
          </div>
          <Link to="/vender" className="rounded-full bg-accent px-6 py-3 font-bold text-accent-foreground hover:bg-accent/90">Publicar anuncio</Link>
        </div>
      </section>
    </main>
  );
}
