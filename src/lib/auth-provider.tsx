import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "@/lib/auth-context";
import type { AccountProfile } from "@/lib/auth-context";
import { isSchemaMismatch } from "@/lib/account-schema";
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

    if (!supabase) {
      setProfileError("La autenticación no está configurada.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const profileResult = await supabase
        .from("users")
        .select("id, email, full_name, phone, role, agency_id")
        .eq("id", currentUser.id)
        .maybeSingle();

      const profileData = profileResult.data;
      const profileErrorData = profileResult.error;

      const fallbackProfileResult =
        profileData || !profileErrorData || !isSchemaMismatch(profileErrorData)
          ? null
          : await supabase.from("profiles").select("id, full_name, phone").eq("id", currentUser.id).maybeSingle();

      const effectiveProfile = profileData ?? fallbackProfileResult?.data ?? null;
      const effectiveProfileError = effectiveProfile ? null : profileErrorData ?? fallbackProfileResult?.error ?? null;

      const roleResult = await supabase.from("user_roles").select("role").eq("user_id", currentUser.id);
      const roleRows = roleResult.data ?? [];
      const roleError = roleResult.error;

      const fallbackRoleResult =
        roleRows.length > 0 || !roleError || !isSchemaMismatch(roleError)
          ? null
          : await supabase.from("users").select("role").eq("id", currentUser.id).maybeSingle();

      const effectiveRoleRows = roleRows.length > 0 ? roleRows : fallbackRoleResult?.data ? [{ role: fallbackRoleResult.data.role }] : [];
      const effectiveRoleError = effectiveRoleRows.length > 0 ? null : roleError ?? fallbackRoleResult?.error ?? null;

      const agencyResult = await supabase
        .from("agency_members")
        .select("agency_id")
        .eq("user_id", currentUser.id)
        .limit(1)
        .maybeSingle();
      const agencyRows = agencyResult.data;
      const agencyError = agencyResult.error;

      const fallbackAgencyResult =
        agencyRows || !agencyError || !isSchemaMismatch(agencyError)
          ? null
          : await supabase.from("users").select("agency_id").eq("id", currentUser.id).maybeSingle();

      const effectiveAgency = agencyRows ?? fallbackAgencyResult?.data ?? null;
      const effectiveAgencyError = effectiveAgency ? null : agencyError ?? fallbackAgencyResult?.error ?? null;

      if (requestId !== profileRequest.current) return;

      if (effectiveProfileError || effectiveRoleError || effectiveAgencyError) {
        throw effectiveProfileError ?? effectiveRoleError ?? effectiveAgencyError;
      }

      const normalizedRole = normalizeAccountRole(
        effectiveRoleRows[0]?.role ?? effectiveProfile?.role ?? currentUser.user_metadata?.requested_role ?? "seller",
      );
      if (!normalizedRole || !isAccountRole(normalizedRole)) {
        setProfile(null);
        setProfileError("Tu cuenta todavía no tiene un perfil con rol asignado.");
      } else {
        setProfile({
          id: currentUser.id,
          email: effectiveProfile?.email ?? currentUser.email ?? null,
          fullName:
            effectiveProfile?.full_name ??
            effectiveProfile?.fullName ??
            currentUser.user_metadata?.full_name ??
            null,
          phone: effectiveProfile?.phone ?? null,
          role: normalizedRole,
          agencyId: effectiveAgency?.agency_id ?? effectiveProfile?.agency_id ?? null,
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
