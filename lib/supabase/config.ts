/**
 * Supabase runtime configuration.
 *
 * The app supports two modes, selected purely by environment:
 *
 *  - REAL SUPABASE MODE  — when NEXT_PUBLIC_SUPABASE_URL and
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY are set. Auth, profiles, and storage go
 *    through Supabase; see supabase/migrations/0001_init.sql for the schema
 *    and Row Level Security policies.
 *  - DEMO MODE (default) — signed-cookie demo sessions, disk-backed account
 *    registry, browser-side demo catalog, and a local disk storage adapter
 *    for trainer uploads. Exists so the full product is demonstrable without
 *    a backend.
 *
 * These two variables are PUBLIC by design (anon key, guarded by RLS).
 * The service-role key must NEVER be referenced in client code — this app
 * does not use it at all.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}

export type DataMode = "supabase" | "demo";

export function dataMode(): DataMode {
  return isSupabaseConfigured() ? "supabase" : "demo";
}
