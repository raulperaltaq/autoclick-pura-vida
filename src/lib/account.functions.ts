import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profile, roles, memberships] = await Promise.all([
      context.supabase.from("profiles").select("*").eq("id", context.userId).single(),
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase.from("agency_members").select("agency_id, member_role, agencies(*)").eq("user_id", context.userId),
    ]);
    if (profile.error) throw new Error("No se pudo cargar tu perfil.");
    if (roles.error || memberships.error) throw new Error("No se pudieron verificar tus permisos.");
    return { profile: profile.data, roles: roles.data.map((r) => r.role), memberships: memberships.data };
  });