import type { SessionUser } from "@/lib/auth/types";
import { createSupabaseServerClient } from "./server";

/**
 * REAL MODE session mapping. Reads the Supabase Auth session and the
 * profile row, and projects both onto the app-wide SessionUser shape so
 * guards, layouts, and views never know which backend is active.
 *
 * The profile row is the single source of truth for role and status —
 * both are admin-managed, never client-provided.
 */
export async function getSupabaseSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, name, initials, role, status, title")
    .eq("id", user.id)
    .single();

  // Profile row is created by the on_auth_user_created trigger; if it is
  // momentarily missing, treat the account as pending rather than leaking
  // an unauthenticated identity into role guards.
  if (!profile) {
    return {
      id: user.id,
      email: user.email ?? "",
      name: (user.user_metadata?.name as string) ?? "New user",
      initials: "CC",
      role: "trainee",
      status: "pending",
      title: "",
    };
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    initials: profile.initials || "CC",
    role: profile.role as SessionUser["role"],
    status: profile.status as SessionUser["status"],
    title: profile.title ?? "",
  };
}
