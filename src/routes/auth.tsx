import { createFileRoute, redirect } from "@tanstack/react-router";
import { safeReturnPath } from "@/lib/account";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => {
    const returnPath = safeReturnPath(search["redirect"]);
    return {
      tipo: search["tipo"] === "agencia" ? ("agencia" as const) : ("particular" as const),
      modo: search["modo"] === "registro" ? ("registro" as const) : ("login" as const),
      ...(returnPath ? { redirect: returnPath } : {}),
    };
  },
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/acceder",
      search: {
        mode: search.modo === "registro" ? "signup" : "login",
        role: search.tipo === "agencia" ? "agency" : "seller",
        ...(search.redirect ? { redirect: search.redirect } : {}),
      },
    });
  },
});
