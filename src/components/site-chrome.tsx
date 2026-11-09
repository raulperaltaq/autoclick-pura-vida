import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/use-auth";

export function SiteHeader() {
  const { user, profile, isLoading, signOut } = useAuth();
  const [signOutError, setSignOutError] = useState("");

  const handleSignOut = async () => {
    setSignOutError("");
    try {
      await signOut();
    } catch (error) {
      console.error("Could not sign out:", error);
      setSignOutError("No se pudo cerrar sesión. Intentá nuevamente.");
    }
  };

  const accountHref = profile?.role === "agency" ? "/dashboard/agencia" : "/mi-cuenta";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link to="/" className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          autoclick<span className="text-accent">.cr</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-1 text-sm font-semibold">
          <Link to="/autos" search={{ q: "" }} className="rounded-full px-3 py-2 text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            Comprar
          </Link>
          <Link to="/vender" className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Vender
          </Link>
          {!isLoading && (user ? (
            <>
              <Link to={accountHref} className="rounded-full px-3 py-2 text-muted-foreground hover:text-foreground">
                {profile?.role === "agency" ? "Panel Agencia" : "Mi cuenta"}
              </Link>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="rounded-full px-3 py-2 text-muted-foreground hover:text-foreground"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/acceder" search={{ mode: "login", role: "seller" }} className="rounded-full px-3 py-2 text-muted-foreground hover:text-foreground">
              Acceder
            </Link>
          ))}
        </nav>
      </div>
      {signOutError && <p role="alert" className="mx-auto max-w-6xl px-4 pb-2 text-right text-xs text-destructive">{signOutError}</p>}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-extrabold">autoclick<span className="text-accent">.cr</span></p>
          <p className="mt-2 text-sm opacity-70">Comprar o vender un vehículo en Costa Rica, directamente entre personas. No necesitas crear una cuenta.</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Explorar</p>
          <ul className="mt-2 space-y-1 opacity-70">
            <li><Link to="/autos" search={{ q: "" }}>Vehículos en venta</Link></li>
            <li><Link to="/vender">Publicar anuncio</Link></li>
          </ul>
        </div>
        <p className="text-sm opacity-60 sm:text-right">© 2026 autoclick.cr · Hecho en Costa Rica</p>
      </div>
    </footer>
  );
}
