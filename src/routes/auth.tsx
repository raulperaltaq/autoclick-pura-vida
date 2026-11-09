import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Building2, UserRound, Mail, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/components/session-provider";
import { Button } from "@/components/ui/button";
import { getAccount } from "@/lib/account.functions";
import { accountHead, accountHome, safeReturnPath } from "@/lib/account";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ tipo: s['tipo'] === "agencia" ? "agencia" : "particular", modo: s['modo'] === "registro" ? "registro" : "login", redirect: safeReturnPath(s['redirect']) ?? "" }),
  head: () => accountHead("Acceder", "Iniciá sesión o creá tu cuenta particular o de agencia en autoclick.cr."),
  component: AuthPage,
});

const field = "w-full rounded-md border border-input bg-card px-3 py-3 outline-none focus:ring-2 focus:ring-ring";
function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const cache = useQueryClient();
  const session = useSession();
  const fetchAccount = useServerFn(getAccount);
  const account = useQuery({ queryKey: ["account", session.user?.id], queryFn: () => fetchAccount(), enabled: !!session.user });
  const [mode, setMode] = useState(search.modo);
  const [type, setType] = useState(search.tipo);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [forgot, setForgot] = useState(false);
  useEffect(() => { setType(search.tipo); setMode(search.modo); }, [search.tipo, search.modo]);
  useEffect(() => {
    if (!session.user || !account.data) return;
    const savedType = sessionStorage.getItem("account-type");
    if ((type === "agencia" || savedType === "agencia") && !account.data.roles.includes("agency")) return;
    const destination = safeReturnPath(search.redirect) || safeReturnPath(sessionStorage.getItem("account-return")) || accountHome(account.data.roles);
    sessionStorage.removeItem("account-return"); sessionStorage.removeItem("account-type");
    void navigate({ to: destination, replace: true });
  }, [session.user, account.data, navigate, search.redirect, type]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      if (forgot) {
        const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (result.error) throw result.error;
        setMessage("Revisá tu correo para restablecer la contraseña.");
      } else if (mode === "registro") {
        sessionStorage.setItem("account-type", type);
        if (search.redirect) sessionStorage.setItem("account-return", search.redirect);
        const result = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/auth", data: { full_name: name } } });
        if (result.error) throw result.error;
        if (!result.data.session) setMessage("Revisá tu correo y confirmá tu cuenta antes de acceder.");
        else await session.refresh();
      } else {
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
        await session.refresh();
      }
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo acceder. Intentá de nuevo."); }
    finally { setBusy(false); }
  }
  async function social(provider: "google" | "microsoft") {
    setBusy(true); setError("");
    sessionStorage.setItem("account-type", type);
    if (search.redirect) sessionStorage.setItem("account-return", search.redirect);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) throw result.error;
      if (!result.redirected) await session.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo acceder."); }
    finally { setBusy(false); }
  }
  async function createAgency(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const result = await supabase.rpc("create_my_agency", { agency_name: agencyName });
    if (result.error) setError("No se pudo crear la agencia. Intentá de nuevo.");
    else { await cache.invalidateQueries({ queryKey: ["account"] }); await navigate({ to: "/dashboard/agencia", replace: true }); }
    setBusy(false);
  }
  if (session.user && account.isError) return <main className="mx-auto max-w-lg px-4 py-16"><p role="alert">No se pudo cargar tu cuenta.</p><Button onClick={() => void account.refetch()}>Reintentar</Button></main>;
  const needsAgency = session.user && account.data && !account.data.roles.includes("agency") && type === "agencia";
  return <main className="mx-auto max-w-md px-4 py-12 sm:py-16">
    <p className="text-sm font-semibold text-primary">autoclick.cr</p>
    <h1 className="mt-2 text-3xl font-extrabold">{needsAgency ? "Tu agencia" : forgot ? "Recuperar contraseña" : mode === "registro" ? "Crear cuenta" : "Bienvenido de nuevo"}</h1>
    <div className="mt-6 grid grid-cols-2 gap-2"><Button variant={type === "particular" ? "default" : "outline"} onClick={() => {setType("particular"); sessionStorage.setItem("account-type", "particular");}}><UserRound />Particular</Button><Button variant={type === "agencia" ? "default" : "outline"} onClick={() => {setType("agencia"); sessionStorage.setItem("account-type", "agencia");}}><Building2 />Agencia</Button></div>
    {needsAgency ? <form onSubmit={createAgency} className="mt-6 space-y-4"><label className="block text-sm font-semibold">Nombre de la agencia<input required minLength={2} maxLength={100} className={`${field} mt-2`} value={agencyName} onChange={e => setAgencyName(e.target.value)} /></label><Button disabled={busy} className="w-full" type="submit">Crear agencia<ArrowRight /></Button></form> : !session.user && <>
      {!forgot && <div className="mt-6 space-y-3"><Button variant="outline" disabled={busy} className="google-auth w-full h-11" onClick={() => void social("google")}><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>Continuar con Google</Button><Button variant="outline" disabled={busy} className="w-full h-11" onClick={() => void social("microsoft")}>Continuar con Microsoft</Button><p className="py-1 text-center text-xs text-muted-foreground">o con tu correo electrónico</p></div>}
      <form onSubmit={submit} className="mt-5 space-y-4">{mode === "registro" && !forgot && <label className="block text-sm font-semibold">Nombre completo<input className={`${field} mt-2`} required autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></label>}
        <label className="block text-sm font-semibold">Correo electrónico<input className={`${field} mt-2`} type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
        {!forgot && <label className="block text-sm font-semibold">Contraseña<input className={`${field} mt-2`} type="password" required minLength={8} autoComplete={mode === "registro" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} /></label>}
        <Button type="submit" className="h-11 w-full" disabled={busy || session.loading}><Mail />{busy ? "Un momento…" : forgot ? "Enviar enlace" : mode === "registro" ? "Crear cuenta" : "Iniciar sesión"}</Button>
      </form><div className="mt-4 flex flex-wrap justify-center gap-2"><Button variant="link" onClick={() => {setForgot(false); setMode(mode === "registro" ? "login" : "registro"); setMessage("");setError("");}}>{mode === "registro" ? "Ya tengo cuenta" : "Crear cuenta"}</Button><Button variant="link" onClick={() => {setForgot(!forgot); setMessage("");setError("");}}>{forgot ? "Volver al acceso" : "Olvidé mi contraseña"}</Button></div>
    </>}
    {session.user && !needsAgency && <p className="mt-6 text-muted-foreground">Cargando tu cuenta…</p>}
    {message && <p role="status" className="mt-5 rounded-md bg-secondary p-4 text-sm">{message}</p>}{(error || session.error) && <p role="alert" className="mt-5 text-sm text-destructive">{error || session.error}</p>}
  </main>;
}