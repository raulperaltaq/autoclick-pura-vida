import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { getLoginRoleForAccess, hasAllowedRole, type AccountRole } from "@/lib/account-roles";
import { useAuth } from "@/lib/use-auth";

export function AuthOnly({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: AccountRole[];
}) {
  const { user, profile, isLoading, isConfigured, profileError } = useAuth();

  if (!isConfigured) {
    return (
      <AccessMessage
        title="Cuenta no disponible"
        message="La autenticación todavía no está configurada para este sitio."
      />
    );
  }
  if (isLoading) {
    return <AccessMessage title="Cargando cuenta" message="Estamos verificando tu sesión." />;
  }
  if (!user) {
    return (
      <AccessMessage
        title="Iniciá sesión para continuar"
        message="Esta sección está disponible para usuarios registrados."
      >
        <Link
          to="/acceder"
          search={{ mode: "login", role: getLoginRoleForAccess(allowedRoles) }}
          className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 font-bold text-primary-foreground"
        >
          Acceder
        </Link>
      </AccessMessage>
    );
  }
  if (!profile) {
    return (
      <AccessMessage
        title="No se pudo cargar tu perfil"
        message={profileError ?? "La cuenta todavía no tiene un perfil asignado."}
      />
    );
  }
  if (allowedRoles && !hasAllowedRole(profile.role, allowedRoles)) {
    return (
      <AccessMessage
        title="Acceso no disponible"
        message="Tu tipo de cuenta no tiene acceso a esta sección."
      />
    );
  }

  return children;
}

function AccessMessage({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{message}</p>
        {children}
      </div>
    </main>
  );
}
