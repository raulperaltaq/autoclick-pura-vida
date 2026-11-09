import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { UserRound, LogOut, ChevronDown, Building2, Heart, Car, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/use-auth";

export function AccountMenu() {
  const { user, profile, isLoading, signOut: authSignOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const router = useRouter();
  const agency = profile?.role === "agency";
  const [error, setError] = useState("");
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    try {
      await authSignOut();
      await navigate({
        to: "/acceder",
        search: { mode: "login", role: "seller" },
        replace: true,
      });
      await router.invalidate();
    } catch (signOutError) {
      console.error("Could not sign out from the account menu:", signOutError);
      setError("No se pudo cerrar la sesión. Intentá de nuevo.");
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" disabled={isLoading} className="px-2 sm:px-3">
          <UserRound />
          <span>{user ? "Mi cuenta" : "Acceder"}</span>
          <ChevronDown className="hidden sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user ? (
          <>
            <DropdownMenuLabel className="truncate">
              {profile?.fullName || "Mi cuenta"}
            </DropdownMenuLabel>
            {agency && (
              <DropdownMenuItem asChild>
                <Link to="/dashboard/agencia">
                  <Building2 />
                  Panel Agencia
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link to="/mis-vehiculos">
                <Car />
                Mis vehículos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/favoritos">
                <Heart />
                Favoritos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/mi-cuenta">
                <UserRound />
                Mi perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void signOut()}>
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
            {error && (
              <p role="alert" className="p-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link to="/acceder" search={{ mode: "login", role: "seller" }}>
                <UserRound />
                Particular
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/acceder" search={{ mode: "login", role: "agency" }}>
                <Building2 />
                Agencia
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/acceder" search={{ mode: "signup", role: "seller" }}>
                <UserPlus />
                Crear cuenta
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
