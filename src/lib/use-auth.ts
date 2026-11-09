import { useContext } from "react";
import { AuthContext } from "@/lib/auth-context";
import type { AuthContextValue } from "@/lib/auth-context";

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
