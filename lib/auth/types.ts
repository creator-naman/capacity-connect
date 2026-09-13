import type { Role } from "@/lib/types/nav";

export type AccountStatus = "active" | "pending" | "disabled";

/**
 * The identity carried by the session cookie. Deliberately small —
 * profile detail (qualifications, skills, etc.) lives in the domain
 * layer, not in auth. When Supabase Auth lands, this maps from the
 * JWT claims + a `profiles` row and every guard keeps working.
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  initials: string;
  role: Role;
  status: AccountStatus;
  /** Professional designation shown in the shell, e.g. "Scientist-B". */
  title: string;
}

export interface DemoAccount extends SessionUser {
  password: string;
}

export interface ActionState {
  error?: string;
  success?: string;
  /** REAL mode: the server action validated input; the browser client
   *  must finish the flow with the user's own Supabase session. */
  pendingClient?: boolean;
}
