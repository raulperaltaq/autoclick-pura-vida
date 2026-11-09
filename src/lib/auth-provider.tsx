import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { AccountRole } from "@/lib/account-roles";
import { AuthContext } from "@/lib/auth-context";
import type { AccountProfile } from "@/lib/auth-context";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type { AccountRole } from "@/lib/account-roles";

function isAccountRole(role: unknown): role is AccountRole {
  return role === "buyer" || role === "seller" || role === "agency" || role === "admin";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const profileRequest = useRef(0);

  const loadProfile = useCallback(async (currentUser: User | null) => {
    const requestId = ++profileRequest.current;
    if (!currentUser) {
      setProfile(null);
      setProfileError(null);
      setIsLoading(false);
      return;
    }

    if (!supabase) {
      setProfileError("La autenticación no está configurada.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email, full_name, role, agency_id")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (requestId !== profileRequest.current) return;

      if (error) throw error;
      if (!data || !isAccountRole(data.role)) {
        setProfile(null);
        setProfileError("Tu cuenta todavía no tiene un perfil con rol asignado.");
      } else {
        setProfile({
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          role: data.role,
          agencyId: data.agency_id,
        });
        setProfileError(null);
      }
    } catch (error) {
      if (requestId !== profileRequest.current) return;
      console.error("Could not load the authenticated user's profile:", error);
      setProfile(null);
      setProfileError("No se pudo cargar tu perfil. Verificá la configuración de la cuenta.");
    } finally {
      if (requestId === profileRequest.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsLoading(true);
      window.setTimeout(() => {
        if (active) void loadProfile(currentUser);
      }, 0);
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error("Could not restore the Supabase session:", error);
        setProfileError("No se pudo restaurar tu sesión. Iniciá sesión nuevamente.");
        setIsLoading(false);
        return;
      }

      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      void loadProfile(currentUser);
    }).catch((error: unknown) => {
      if (!active) return;
      console.error("Could not restore the Supabase session:", error);
      setProfileError("No se pudo restaurar tu sesión. Iniciá sesión nuevamente.");
      setIsLoading(false);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
      profileRequest.current += 1;
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    if (!supabase) throw new Error("La autenticación todavía no está configurada.");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(user);
  }, [loadProfile, user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isConfigured: isSupabaseConfigured,
        profileError,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
