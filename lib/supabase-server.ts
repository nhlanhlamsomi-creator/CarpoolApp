import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import ws from "ws";

const resolveEnv = (...names: string[]) => {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
};

const supabaseUrl = resolveEnv(
  "NEXT_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_URL",
  "SUPABASE_URL",
);

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE ROLE, not anon.
//
// This client only ever runs inside API routes on the server. The service role
// key bypasses Row Level Security, which is what lets these routes read and
// write the users table on behalf of a Clerk-authenticated caller.
//
// With the anon key, any RLS policy blocks the write: the update matches zero
// rows, returns no error, and the database silently stays empty.
//
// The variable must NOT be prefixed EXPO_PUBLIC_ — that would bundle the key
// into the app that ships to phones, handing anyone full database access.
// ─────────────────────────────────────────────────────────────────────────────
const serviceRoleKey = resolveEnv(
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
);

const anonKey = resolveEnv(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_ANON_KEY",
);

let warnedAboutAnonFallback = false;

export function getSupabaseServerClient() {
  const key = serviceRoleKey ?? anonKey;

  if (!supabaseUrl || !key) {
    throw new Error(
      "Supabase environment variables are not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env",
    );
  }

  // Falling back to anon keeps the app running, but says so loudly — a silent
  // fallback here looks exactly like "saving does nothing".
  if (!serviceRoleKey && !warnedAboutAnonFallback) {
    warnedAboutAnonFallback = true;
    console.warn(
      "\n⚠️  SUPABASE_SERVICE_ROLE_KEY is not set — falling back to the anon key.\n" +
        "   Writes to RLS-protected tables will silently fail.\n" +
        "   Add it to .env from Supabase → Settings → API → service_role.\n",
    );
  }

  return createSupabaseClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    realtime: {
      transport: ws as unknown as typeof WebSocket,
    },
  });
}