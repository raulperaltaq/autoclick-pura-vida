import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profileResult, rolesResult, membershipsResult] = await Promise.all([
      context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase
        .from("agency_members")
        .select("agency_id, member_role, agencies(*)")
        .eq("user_id", context.userId),
    ]);

    const firstError = profileResult.error ?? rolesResult.error ?? membershipsResult.error;
    if (firstError) throw firstError;

    const profile = profileResult.data;
    if (!profile) throw new Error("No se pudo cargar tu perfil.");

    return {
      profile,
      roles: (rolesResult.data ?? []).map((row) => row.role),
      memberships: membershipsResult.data ?? [],
    };
  });
