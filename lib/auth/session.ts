import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/lib/types/nav";
import type { SessionUser } from "./types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseSessionUser } from "@/lib/supabase/auth";

/**
 * Session resolution for both modes:
 *
 *  - REAL SUPABASE MODE: the Supabase Auth session (via cookies) + the
 *    profile row. Role/status come from the profile, which only admins
 *    can change.
 *  - DEMO MODE: an HMAC-signed JSON cookie so role guards run server-side.
 *    The signing secret is a constant because this is demo mode; production
 *    deployments use Supabase sessions instead.
 *
 * Guards and UI call getSession()/requireRole() and never need to know
 * which mode is active.
 */
export const SESSION_COOKIE = "cc_session";

const DEMO_SECRET = "capacity-connect-demo-signing-secret";

function sign(payload: string): string {
  return createHmac("sha256", DEMO_SECRET).update(payload).digest("base64url");
}

export function encodeSession(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(raw: string | undefined): SessionUser | null {
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  const expected = sign(payload);
  if (signature.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionUser;
    if (!parsed.id || !parsed.role || !parsed.status) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Reads and verifies the session in whichever mode is active. */
export async function getSession(): Promise<SessionUser | null> {
  if (isSupabaseConfigured()) {
    return getSupabaseSessionUser();
  }
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}

export function dashboardPath(role: Role): string {
  return `/${role}/dashboard`;
}

/**
 * Server-side role guard for role-scoped layouts. Enforces (not merely
 * hides): unauthenticated → login; pending/disabled → their status page;
 * wrong role → unauthorized. Returns the verified user for layout use.
 */
export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await getSession();

  if (!user) redirect("/login");
  if (user.status === "pending") redirect("/pending-approval");
  if (user.status === "disabled") redirect("/account-disabled");
  if (user.role !== role) redirect("/unauthorized");

  return user;
}

/** Layout-level convenience for public pages: signed-in users skip auth screens. */
export async function requireAnonymous(): Promise<SessionUser | null> {
  const user = await getSession();
  if (user && user.status === "active") redirect(dashboardPath(user.role));
  return user;
}
