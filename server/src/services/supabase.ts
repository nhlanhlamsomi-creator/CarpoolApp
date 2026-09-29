import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../middleware/errorHandler";

let client: SupabaseClient | undefined;

export function getSupabaseServerClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new HttpError(500, "Supabase is not configured");
  }

  client = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return client;
}