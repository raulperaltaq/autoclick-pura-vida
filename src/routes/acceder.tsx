import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { getAccountHomeRoute } from "@/lib/account-roles";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/use-auth";

type AccountType = "seller" | "agency";
type AuthMode = "login" | "signup";
type OAuthProvider = "google" | "azure" | "facebook";

export const Route = createFileRoute("/acceder")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search["mode"] === "signup" ? "signup" as const : "login" as const,
    role: search["role"] === "agency" ? "agency" as const : "seller" as const,
  }),
  head: () => ({
    meta: [
      { title: "Acceder o crear cuenta | autoclick.cr" },
      { name: "description", content: "Accedé a tu cuenta o registrate en autoclick.cr." },
    ],
  }),
  component: AccessPage,
});

function AccessPage() {
  const search = Route.useSearch();
  const { user, profile, isLoading, isConfigured, profileError, refreshProfile } = useAuth();
  const [mode, setMode] = useState<AuthMode>(search.mode);
  const [accountType, setAccountType] = useState<AccountType>(search.role);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [oauthProvisioning, setOauthProvisioning] = useState(false);
  const [oauthProvisionedUser, setOauthProvisionedUser] = useState<string | null>(null);
  const [oauthProvisionAttemptedUser, setOauthProvisionAttemptedUser] = useState<string | null>(null);

  useEffect(() => {
    setMode(search.mode);
    setAccountType(search.role);
  }, [search.mode, search.role]);

  useEffect(() => {
    const isOAuthSignup = Boolean(user && mode === "signup" && user.app_metadata.provider !== "email");
    if (!user || isLoading || !profile || (isOAuthSignup && oauthProvisionedUser !== user.id)) return;
    window.location.replace(getAccountHomeRoute(profile.role));
  }, [isLoading, mode, oauthProvisionedUser, profile, user]);

  useEffect(() => {
    const isOAuthSignup = Boolean(user && mode === "signup" && user.app_metadata.provider !== "email");
    if (
      !isOAuthSignup ||
      !user ||
      isLoading ||
      !supabase ||
      oauthProvisionedUser === user.id ||
      oauthProvisionAttemptedUser === user.id ||
      oauthProvisioning
    ) return;

    let active = true;
    setOauthProvisionAttemptedUser(user.id);
    setOauthProvisioning(true);
    void (async () => {
      try {
        const { error } = await supabase.rpc("complete_signup", { requested_role: accountType });
        if (error) throw error;
        await refreshProfile();
        if (active) setOauthProvisionedUser(user.id);
      } catch (error) {
        if (!active) return;
        console.error("Could not provision the OAuth account:", error);
        setErrorMessage(error instanceof Error ? error.message : "No se pudo configurar el perfil de la cuenta.");
      } finally {
        if (active) setOauthProvisioning(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [
    accountType,
    isLoading,
    mode,
    oauthProvisionAttemptedUser,
    oauthProvisionedUser,
    oauthProvisioning,
    refreshProfile,
    user,
  ]);

  const redirectUrl = (redirectMode: AuthMode) => {
    const url = new URL("/acceder", window.location.origin);
    url.searchParams.set("mode", redirectMode);
    url.searchParams.set("role", accountType);
    return url.toString();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!supabase) {
      setErrorMessage("La autenticación no está configurada. Conectá Supabase desde Lovable para continuar.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              requested_role: accountType,
            },
            emailRedirectTo: redirectUrl("login"),
          },
        });
        if (error) throw error;

        if (data.session) {
          setMessage("Cuenta creada. Estamos cargando tu perfil.");
        } else {
          setMessage("Te enviamos un correo para confirmar tu cuenta antes de iniciar sesión.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("Sesión iniciada. Cargando tu cuenta…");
      }
    } catch (error) {
      console.error("Authentication request failed:", error);
      setErrorMessage(error instanceof Error ? error.message : "No se pudo completar la autenticación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: OAuthProvider) => {
    setMessage("");
    setErrorMessage("");
    if (!supabase) {
      setErrorMessage("La autenticación no está configurada. Conectá Supabase desde Lovable para continuar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl(mode),
          ...(provider === "azure" ? { scopes: "email" } : {}),
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error(`Sign-in with ${provider} failed:`, error);
      setErrorMessage(error instanceof Error ? error.message : "No se pudo iniciar sesión con ese proveedor.");
      setIsSubmitting(false);
    }
  };

  const field =
    "w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:ring-2 focus:ring-ring";

  return (
    <main className="mx-auto max-w-lg px-4 py-12 sm:py-16">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <Link to="/" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
          ← Volver al inicio
        </Link>
        <h1 className="mt-5 text-3xl font-extrabold">
          {mode === "signup" ? "Crear cuenta" : "Acceder"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Navegar y buscar vehículos no requiere iniciar sesión.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-muted p-1" aria-label="Tipo de cuenta">
          {([
            ["seller", "Particular"],
            ["agency", "Agencia"],
          ] as const).map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => setAccountType(type)}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                accountType === type
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <OAuthButton label="Google" disabled={!isConfigured || isSubmitting || isLoading} onClick={() => void handleOAuth("google")} />
          <OAuthButton label="Microsoft" disabled={!isConfigured || isSubmitting || isLoading} onClick={() => void handleOAuth("azure")} />
          <OAuthButton label="Facebook" disabled={!isConfigured || isSubmitting || isLoading} onClick={() => void handleOAuth("facebook")} />
        </div>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span>o con correo electrónico</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {mode === "signup" && (
            <label className="grid gap-1.5 text-sm font-semibold">
              Nombre completo
              <input
                autoComplete="name"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className={field}
              />
            </label>
          )}
          <label className="grid gap-1.5 text-sm font-semibold">
            Correo electrónico
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={field}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Contraseña
            <input
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={field}
            />
            {mode === "signup" && (
              <span className="font-normal text-muted-foreground">Usá al menos 8 caracteres.</span>
            )}
          </label>
          <button
            type="submit"
            disabled={!isConfigured || isSubmitting || isLoading}
            className="mt-1 rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting || oauthProvisioning ? "Procesando…" : mode === "signup" ? "Crear cuenta" : "Iniciar sesión"}
          </button>
        </form>

        {!isConfigured && (
          <p role="status" className="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
            La autenticación estará disponible al configurar Supabase y las variables de entorno indicadas en
            <code className="mx-1 font-semibold">.env.example</code>.
          </p>
        )}
        {profileError && user && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p role="alert">{profileError}</p>
            <button
              type="button"
              onClick={() => void refreshProfile()}
              className="mt-2 font-semibold text-primary hover:underline"
            >
              Reintentar
            </button>
          </div>
        )}
        {message && <p role="status" className="mt-4 text-sm text-primary">{message}</p>}
        {errorMessage && <p role="alert" className="mt-4 text-sm text-destructive">{errorMessage}</p>}
        {errorMessage && user && mode === "signup" && (
          <button
            type="button"
            onClick={() => {
              setErrorMessage("");
              setOauthProvisionAttemptedUser(null);
            }}
            className="mt-2 text-sm font-semibold text-primary hover:underline"
          >
            Reintentar configuración de cuenta
          </button>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "¿Ya tenés cuenta?" : "¿Primera vez en AutoClick?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "login" : "signup");
              setMessage("");
              setErrorMessage("");
            }}
            className="font-bold text-primary hover:underline"
          >
            {mode === "signup" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </p>
      </div>
    </main>
  );
}

function OAuthButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full border border-border px-3 py-2 text-sm font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      {label}
    </button>
  );
}
