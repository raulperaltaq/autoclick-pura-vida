import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { accountHead } from "@/lib/account";
export const Route = createFileRoute("/reset-password")({ head: () => accountHead("Restablecer contraseña", "Elegí una nueva contraseña para tu cuenta de autoclick.cr."), component: ResetPassword });
function ResetPassword() {
  const navigate = useNavigate();
  const [recovery, setRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setRecovery(new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery" || sessionStorage.getItem("password-recovery") === "true"); }, []);
  async function submit(e: FormEvent) { e.preventDefault(); if (password !== confirm) {setError("Las contraseñas no coinciden.");return;} setBusy(true); const result = await supabase.auth.updateUser({ password }); if (result.error) setError(result.error.message); else { sessionStorage.removeItem("password-recovery"); await navigate({to:"/mi-perfil"}); } setBusy(false); }
  return <main className="mx-auto max-w-md px-4 py-16"><h1 className="text-3xl font-bold">Nueva contraseña</h1>{recovery ? <form onSubmit={submit} className="mt-6 space-y-4"><label className="block">Contraseña<input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-md border bg-card p-3" /></label><label className="block">Confirmar contraseña<input required type="password" minLength={8} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-2 w-full rounded-md border bg-card p-3" /></label><Button type="submit" disabled={busy}>Guardar contraseña</Button></form> : <p className="mt-6">Abrí el enlace de recuperación que recibiste por correo.</p>}{error && <p role="alert" className="mt-4 text-destructive">{error}</p>}</main>;
}