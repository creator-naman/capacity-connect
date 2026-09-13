"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Browser Supabase client (anon key only). Callers must check
 * isSupabaseConfigured() first — in demo mode no Supabase client exists.
 */
export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured (demo mode is active).");
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
