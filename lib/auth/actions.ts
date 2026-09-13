"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Role } from "@/lib/types/nav";
import { DEMO_ACCOUNTS, findDemoAccount } from "./accounts";
import {
  applyOverrides,
  createPendingAccount,
  findRegisteredAccount,
  setRole as setRegistryRole,
  setStatus as setRegistryStatus,
} from "./registry";
import { SESSION_COOKIE, dashboardPath, encodeSession, getSession } from "./session";
import type { ActionState, AccountStatus, SessionUser } from "./types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseSessionUser } from "@/lib/supabase/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function setSessionCookie(user: SessionUser) {
  const store = await cookies();
  store.set(SESSION_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // half a workday — demo sessions shouldn't outlive it
  });
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = await (await import("@/lib/supabase/server")).createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/login");
  }
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function signIn(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  // ---- REAL SUPABASE MODE ----------------------------------------------
  if (isSupabaseConfigured()) {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    // Uniform error — never reveal whether an email is registered.
    if (error) return { error: "Invalid email or password." };

    const user = await getSupabaseSessionUser();
    if (!user) return { error: "Invalid email or password." };
    if (user.status === "disabled") redirect("/account-disabled");
    if (user.status === "pending") redirect("/pending-approval");
    redirect(next.startsWith("/") && !next.startsWith("//") ? next : dashboardPath(user.role));
  }

  // ---- DEMO MODE ---------------------------------------------------------
  const account = (() => {
    const demo = findDemoAccount(email);
    // Admin approvals/disablings of static demo accounts are stored as
    // registry overrides and applied at sign-in time.
    if (demo) return applyOverrides(demo);
    const registered = findRegisteredAccount(email);
    return registered
      ? {
          id: registered.id,
          email: registered.email,
          name: registered.name,
          initials: registered.initials,
          role: registered.role,
          status: registered.status,
          title: registered.title,
          password: "demo1234",
        }
      : undefined;
  })();

  // Uniform error — never reveal whether an email is registered.
  if (!account || account.password !== password) {
    return { error: "Invalid email or password." };
  }

  const { password: _pw, ...user } = account;
  await setSessionCookie(user);

  if (user.status === "disabled") redirect("/account-disabled");
  if (user.status === "pending") redirect("/pending-approval");

  // Only allow same-site relative paths to avoid an open redirect.
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : dashboardPath(user.role));
}

/**
 * One-click demo sign-in used on the login screen. Exercises the exact
 * same session mechanics as the credential form — only the lookup differs.
 */
export async function demoSignIn(formData: FormData): Promise<void> {
  const role = String(formData.get("role") ?? "") as Role;
  const account = DEMO_ACCOUNTS.map(applyOverrides).find(
    (a) => a.role === role && a.status === "active"
  );
  if (!account) redirect("/login?error=role-unavailable");

  const { password: _pw, ...user } = account;
  await setSessionCookie(user);
  redirect(dashboardPath(user.role));
}

export async function signUp(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "") as Role;
  const title = String(formData.get("title") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (name.length < 2) return { error: "Enter your full name." };
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid official email address." };
  if (role !== "trainee" && role !== "trainer") {
    return { error: "Select whether you are joining as a trainee or trainer." };
  }
  if (title.length < 2) return { error: "Enter your current designation." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  // ---- REAL SUPABASE MODE ----------------------------------------------
  // Role is stored as a REQUEST only; the profile trigger creates every new
  // account as trainee/pending. An admin assigns the actual trainer role
  // after review — self-assigned roles are structurally impossible.
  if (isSupabaseConfigured()) {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, title, requested_role: role },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/login`,
      },
    });
    if (error) {
      if (error.message.toLowerCase().includes("already")) {
        return { error: "An account with this email already exists." };
      }
      return { error: "Could not create the account right now. Please try again." };
    }
    // Session may exist immediately (no email confirmation) or after the
    // user verifies — either way approval is pending.
    redirect("/pending-approval");
  }

  // ---- DEMO MODE ---------------------------------------------------------
  if (findDemoAccount(email) || findRegisteredAccount(email)) {
    return { error: "An account with this email already exists." };
  }

  const user = createPendingAccount({ email, name, role, title });
  await setSessionCookie(user);
  redirect("/pending-approval");
}

export async function forgotPassword(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL_RE.test(email)) {
    return { error: "Enter a valid email address." };
  }

  // ---- REAL SUPABASE MODE: a real recovery email is dispatched. ---------
  if (isSupabaseConfigured()) {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/reset-password`,
    });
    return {
      success:
        "If an account exists for that address, a reset link has been sent.",
    };
  }

  // Demo mode: no mail is sent. The UI shows the success state either way,
  // mirroring the real flow's anti-enumeration behaviour.
  return {
    success:
      "If an account exists for that address, a reset link has been sent. In this demo no email is dispatched — continue to reset password to complete the flow.",
  };
}

export async function resetPassword(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };

  // ---- REAL SUPABASE MODE -------------------------------------------------
  // The recovery link's tokens are exchanged by the browser client
  // (detectSessionInUrl); the update itself must run client-side with the
  // user's own session. ResetPasswordForm handles that branch.
  if (isSupabaseConfigured()) {
    return { pendingClient: true };
  }

  // Demo mode: there is no credential store to update. Report success so
  // the full flow (request → reset → sign in) is walkable by reviewers.
  return { success: "Your password has been updated. You can now sign in." };
}

/* ------------------------------------------------------------------ */
/* Admin account management — thin server mutations over the registry. */
/* ------------------------------------------------------------------ */

export async function setAccountStatus(formData: FormData): Promise<void> {
  // Server-side authorization: only active admins may mutate accounts.
  const caller = await getSession();
  if (!caller || caller.role !== "admin" || caller.status !== "active") redirect("/unauthorized");

  const email = String(formData.get("email") ?? "");
  const status = String(formData.get("status") ?? "") as AccountStatus;
  if (email && ["active", "pending", "disabled"].includes(status)) {
    setRegistryStatus(email, status);
    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");
  }
}

export async function setAccountRole(formData: FormData): Promise<void> {
  // Server-side authorization: only active admins may assign roles. Users
  // can never escalate themselves — the caller's role comes from the signed
  // session, never from form data.
  const caller = await getSession();
  if (!caller || caller.role !== "admin" || caller.status !== "active") redirect("/unauthorized");

  const email = String(formData.get("email") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  if (email && ["trainee", "trainer", "admin"].includes(role)) {
    setRegistryRole(email, role);
    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");
  }
}
