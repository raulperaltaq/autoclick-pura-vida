import { createContext } from "react";
import type { User } from "@supabase/supabase-js";
import type { AccountRole } from "@/lib/account-roles";

export type AccountProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: AccountRole;
  agencyId: string | null;
};

export type AuthContextValue = {
  user: User | null;
  profile: AccountProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  profileError: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
