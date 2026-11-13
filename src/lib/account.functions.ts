import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function hasSchemaMismatch(error: unknown): boolean {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return /(?:\b(column|table|relation)\b.*\b(?:does not exist|do not exist|not found)\b|missing.*(?:column|table|relation))/i.test(message);
}

export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const profileResult = await context.supabase.from("users").select("*").eq("id", context.userId).maybeSingle();
    const fallbackProfileResult =
      profileResult.data || !profileResult.error || !hasSchemaMismatch(profileResult.error)
        ? null
        : await context.supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle();

    const rolesResult = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    const fallbackRoleResult =
      rolesResult.data?.length || !rolesResult.error || !hasSchemaMismatch(rolesResult.error)
        ? null
        : await context.supabase.from("users").select("role").eq("id", context.userId).maybeSingle();

    const membershipsResult = await context.supabase
      .from("agency_members")
      .select("agency_id, member_role, agencies(*)")
      .eq("user_id", context.userId);
    const fallbackMembershipsResult =
      membershipsResult.data?.length || !membershipsResult.error || !hasSchemaMismatch(membershipsResult.error)
        ? null
        : await context.supabase.from("users").select("agency_id").eq("id", context.userId).maybeSingle();

    const profile = profileResult.data ?? fallbackProfileResult?.data ?? null;
    if (!profile) throw new Error("No se pudo cargar tu perfil.");

    const roles =
      rolesResult.data && rolesResult.data.length > 0
        ? rolesResult.data
        : fallbackRoleResult?.data
          ? [{ role: fallbackRoleResult.data.role }]
          : [];
    const memberships =
      membershipsResult.data && membershipsResult.data.length > 0
        ? membershipsResult.data
        : fallbackMembershipsResult?.data
          ? [{ agency_id: fallbackMembershipsResult.data.agency_id ?? null, member_role: "member", agencies: null }]
          : [];

    if (rolesResult.error && !fallbackRoleResult && !(rolesResult.data && rolesResult.data.length > 0)) {
      throw new Error("No se pudieron verificar tus permisos.");
    }
    if (
      membershipsResult.error &&
      !fallbackMembershipsResult &&
      !(membershipsResult.data && membershipsResult.data.length > 0)
    ) {
      throw new Error("No se pudieron verificar tus permisos.");
    }

    return {
      profile,
      roles: roles.map((r) => r.role),
      memberships,
    };
  });