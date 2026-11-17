// Single Supabase client for the whole app: re-export the generated, typed
// Lovable Cloud client so every module shares one session (storage is brokered
// for the preview). Do not create a second createClient instance here.
import { supabase } from "@/integrations/supabase/client";

export { supabase };

export const isSupabaseConfigured = true;
