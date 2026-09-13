import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/**
 * Server Supabase client wired to Next.js cookies so Supabase Auth sessions
 * persist and refresh through the app's own middleware. Anon key only —
 * the service-role key is deliberately never used server-side here so a
 * leaked server log can never grant blanket DB access; RLS does the work.
 */
export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured (demo mode is active).");
  }
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render — token refresh is handled
          // by middleware re-running the session cookie exchange.
        }
      },
    },
  });
}
