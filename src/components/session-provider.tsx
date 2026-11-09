import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

export type SessionState = { user: User | null; loading: boolean; error: string; refresh: () => Promise<void> };
export const SessionContext = createContext<SessionState>({ user: null, loading: true, error: "", refresh: async () => {} });
export const useSession = () => useContext(SessionContext);
export function SessionProvider({ children, value }: { children: ReactNode; value: SessionState }) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}