import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    if (!supabase) {
      throw redirect({
        to: "/acceder",
        search: { mode: "login", role: "seller", redirect: location.href },
      });
    }
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({
        to: "/acceder",
        search: { mode: "login", role: "seller", redirect: location.href },
      });
    }
  },
  component: Outlet,
});
