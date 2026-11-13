import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthOnly } from "@/components/auth-only";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/mi-cuenta")({
  head: () => ({ meta: [{ title: "Mi cuenta | autoclick.cr" }] }),
  component: MyAccountPage,
});

const accountSections = [
  { id: "mis-vehiculos", title: "Mis vehículos", description: "Gestioná tus anuncios, renovaciones y estadísticas." },
  { id: "favoritos", title: "Favoritos", description: "Volvé a los vehículos que guardaste.", to: "/favoritos" },
  { id: "mensajes", title: "Mensajes", description: "Revisá los contactos de las personas interesadas." },
  { id: "mi-perfil", title: "Mi perfil", description: "Actualizá tus datos personales." },
] as const;

function MyAccountPage() {
  const { profile } = useAuth();

  return (
    <AuthOnly allowedRoles={["buyer", "seller", "admin"]}>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <header className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">Mi cuenta</p>
          <h1 className="mt-2 text-4xl font-extrabold">
            Hola{profile?.fullName ? `, ${profile.fullName}` : ""}
          </h1>
          <p className="mt-2 text-muted-foreground">{profile?.email}</p>
        </header>

        {profile?.role === "admin" && (
          <p className="mb-6 rounded-xl border border-primary/30 bg-secondary/60 p-4 text-sm">
            Cuenta administradora.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {accountSections.map((section) => (
            <section key={section.id} id={section.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-xl font-bold">{section.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
              <p className="mt-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                La gestión de cuenta estará disponible cuando se conecte el almacenamiento compartido.
              </p>
              {"to" in section && (
                <Link to={section.to} className="mt-4 inline-flex font-semibold text-primary hover:underline">
                  Ver favoritos
                </Link>
              )}
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/reset-password"
            className="inline-flex rounded-full border border-border px-5 py-2.5 font-semibold hover:bg-muted"
          >
            Cambiar contraseña
          </Link>
          <Link to="/autos" search={{ q: "" }} className="inline-flex rounded-full border border-border px-5 py-2.5 font-semibold hover:bg-muted">
            Seguir explorando vehículos
          </Link>
        </div>
      </main>
    </AuthOnly>
  );
}
