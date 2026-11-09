import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { UserRound, LogOut, ChevronDown, Building2, Heart, Car, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSession } from "@/components/session-provider";
import { getAccount } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";

export function AccountMenu() {
  const session = useSession();
  const fetchAccount = useServerFn(getAccount);
  const account = useQuery({ queryKey: ["account", session.user?.id], queryFn: () => fetchAccount(), enabled: !!session.user });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const router = useRouter();
  const agency = account.data?.roles.includes("agency");
  const [error, setError] = useState("");
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    const result = await supabase.auth.signOut();
    if (result.error) { setError("No se pudo cerrar la sesión. Intentá de nuevo."); return; }
    await navigate({ to: "/auth", replace: true });
    await router.invalidate();
  }
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" disabled={session.loading} className="px-2 sm:px-3"><UserRound /><span>{session.user ? "Mi cuenta" : "Acceder"}</span><ChevronDown className="hidden sm:block" /></Button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      {session.user ? <><DropdownMenuLabel className="truncate">{account.data?.profile.full_name || "Mi cuenta"}</DropdownMenuLabel>
        {agency && <DropdownMenuItem asChild><Link to="/dashboard/agencia"><Building2 />Panel Agencia</Link></DropdownMenuItem>}
        <DropdownMenuItem asChild><Link to="/mis-vehiculos"><Car />Mis vehículos</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/favoritos"><Heart />Favoritos</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/mi-perfil"><UserRound />Mi perfil</Link></DropdownMenuItem>
        <DropdownMenuSeparator /><DropdownMenuItem onSelect={() => void signOut()}><LogOut />Cerrar sesión</DropdownMenuItem>
        {error && <p role="alert" className="p-2 text-sm text-destructive">{error}</p>}
      </> : <><DropdownMenuItem asChild><Link to="/auth" search={{ tipo: "particular" }}><UserRound />Particular</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/auth" search={{ tipo: "agencia" }}><Building2 />Agencia</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem asChild><Link to="/auth" search={{ modo: "registro" }}><UserPlus />Crear cuenta</Link></DropdownMenuItem></>}
    </DropdownMenuContent></DropdownMenu>;
}