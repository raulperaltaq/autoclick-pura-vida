import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "@/lib/auth-context";
import type { AccountProfile } from "@/lib/auth-context";
import { isAccountRole, normalizeAccountRole } from "@/lib/account-roles";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export type { AccountRole } from "@/lib/account-roles";

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

    setIsLoading(true);
    try {
      const [profileResult, roleResult, agencyResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, phone")
          .eq("id", currentUser.id)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", currentUser.id),
        supabase
          .from("agency_members")
          .select("agency_id")
          .eq("user_id", currentUser.id)
          .limit(1)
          .maybeSingle(),
      ]);

      if (requestId !== profileRequest.current) return;

      const firstError = profileResult.error ?? roleResult.error ?? agencyResult.error;
      if (firstError) throw firstError;

      const profileData = profileResult.data;
      const roleRows = roleResult.data ?? [];
      const agencyData = agencyResult.data;

      const normalizedRole = normalizeAccountRole(
        roleRows[0]?.role ?? currentUser.user_metadata?.["requested_role"] ?? "seller",
      );
      if (!normalizedRole || !isAccountRole(normalizedRole)) {
        setProfile(null);
        setProfileError("Tu cuenta todavía no tiene un perfil con rol asignado.");
      } else {
        setProfile({
          id: currentUser.id,
          email: currentUser.email ?? null,
          fullName:
            profileData?.full_name ??
            (currentUser.user_metadata?.["full_name"] as string | undefined) ??
            null,
          phone: profileData?.phone ?? null,
          role: normalizedRole,
          agencyId: agencyData?.agency_id ?? null,
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
