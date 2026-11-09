import { createFileRoute } from "@tanstack/react-router";
import { AuthOnly } from "@/components/auth-only";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/dashboard/agencia")({
  head: () => ({ meta: [{ title: "Panel Agencia | autoclick.cr" }] }),
  component: AgencyDashboardPage,
});

const agencySections = [
  ["inventario", "Inventario"],
  ["agentes", "Agentes"],
  ["leads", "Leads"],
  ["estadisticas", "Estadísticas"],
  ["facturacion", "Facturación"],
  ["configuracion", "Configuración"],
] as const;

function AgencyDashboardPage() {
  const { profile } = useAuth();

  return (
    <AuthOnly allowedRoles={["agency", "admin"]}>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <header className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">Panel Agencia</p>
          <h1 className="mt-2 text-4xl font-extrabold">
            {profile?.fullName ? `Hola, ${profile.fullName}` : "Administrá tu agencia"}
          </h1>
          {profile?.agencyId && (
            <p className="mt-2 text-sm text-muted-foreground">Agencia: {profile.agencyId}</p>
          )}
        </header>

        <nav aria-label="Secciones de agencia" className="mb-6 flex flex-wrap gap-2">
          {agencySections.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">
              {label}
            </a>
          ))}
        </nav>

        <div className="grid gap-4 sm:grid-cols-2">
          {agencySections.map(([id, title]) => (
            <section key={id} id={id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="mt-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Esta función requiere conectar el inventario y los datos de agencia en Supabase.
              </p>
            </section>
          ))}
        </div>
      </main>
    </AuthOnly>
  );
}
