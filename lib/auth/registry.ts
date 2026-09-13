import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Role } from "@/lib/types/nav";
import type { AccountStatus, SessionUser } from "./types";
import { DEMO_ACCOUNTS } from "./accounts";

/**
 * Account registry for demo mode.
 *
 * In-memory state proved fragile for admin workflows (approvals and role
 * changes evaporated on server restart), so the registry is persisted to a
 * JSON file under `.data/` — gitignored, server-only. Writes are atomic
 * (temp file + rename) so a crash mid-write cannot corrupt it.
 *
 * With Supabase this file is replaced by queries against a `profiles`
 * table with a `status` column, guarded by RLS.
 */

interface RegistryEntry {
  id: string;
  email: string;
  name: string;
  initials: string;
  role: Role;
  status: AccountStatus;
  title: string;
  createdAt: string;
}

interface PersistedRegistry {
  version: 1;
  entries: RegistryEntry[];
  /** Admin status/role overrides for the STATIC demo accounts. */
  overrides: Record<string, { status?: AccountStatus; role?: Role }>;
  counter: number;
}

const DATA_DIR = join(process.cwd(), ".data");
const REGISTRY_FILE = join(DATA_DIR, "registry.json");

let cache: PersistedRegistry | null = null;

function emptyRegistry(): PersistedRegistry {
  return { version: 1, entries: [], overrides: {}, counter: 0 };
}

function load(): PersistedRegistry {
  if (cache) return cache;
  try {
    if (existsSync(REGISTRY_FILE)) {
      const parsed = JSON.parse(readFileSync(REGISTRY_FILE, "utf8")) as PersistedRegistry;
      if (parsed.version === 1 && Array.isArray(parsed.entries)) {
        cache = { ...emptyRegistry(), ...parsed };
        return cache;
      }
    }
  } catch {
    // corrupted file — start fresh rather than crash the server
  }
  cache = emptyRegistry();
  return cache;
}

function save(state: PersistedRegistry): void {
  cache = state;
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    const temp = `${REGISTRY_FILE}.${process.pid}.tmp`;
    writeFileSync(temp, JSON.stringify(state, null, 2), "utf8");
    renameSync(temp, REGISTRY_FILE);
  } catch {
    // read-only filesystem — registry degrades to in-memory for this process
  }
}

function newId(state: PersistedRegistry, role: Role): string {
  state.counter += 1;
  const prefix = role === "trainee" ? "trn" : role === "trainer" ? "trh" : "adm";
  return `${prefix}-new${String(state.counter).padStart(3, "0")}`;
}

function toSessionUser(entry: RegistryEntry): SessionUser {
  const { id, email, name, initials, role, status, title } = entry;
  return { id, email, name, initials, role, status, title };
}

/** Applies stored admin overrides to a static demo account's session fields. */
export function applyOverrides<T extends { email: string; status: AccountStatus; role: Role }>(
  account: T
): T {
  const override = load().overrides[account.email.trim().toLowerCase()];
  if (!override) return account;
  return {
    ...account,
    status: override.status ?? account.status,
    role: override.role ?? account.role,
  };
}

export function createPendingAccount(input: {
  email: string;
  name: string;
  role: Role;
  title: string;
}): SessionUser {
  const email = input.email.trim().toLowerCase();
  const state = load();
  const initials = input.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

  const entry: RegistryEntry = {
    id: newId(state, input.role),
    email,
    name: input.name.trim(),
    initials: initials || "CC",
    role: input.role,
    status: "pending",
    title: input.title,
    createdAt: new Date().toISOString(),
  };
  state.entries.push(entry);
  save(state);
  return toSessionUser(entry);
}

export function findRegisteredAccount(email: string): RegistryEntry | undefined {
  return load().entries.find((e) => e.email === email.trim().toLowerCase());
}

export function listRegisteredAccounts(): SessionUser[] {
  return load().entries.map(toSessionUser);
}

/** Admin workflow: approve (activate), disable, or reinstate an account. */
export function setStatus(email: string, status: AccountStatus): SessionUser | null {
  const key = email.trim().toLowerCase();
  const state = load();
  const entry = state.entries.find((e) => e.email === key);
  if (entry) {
    entry.status = status;
    save(state);
    return toSessionUser(entry);
  }
  // Static demo account — record an override the sign-in flow applies.
  const demo = DEMO_ACCOUNTS.find((a) => a.email === key);
  if (demo) {
    state.overrides[key] = { ...state.overrides[key], status };
    save(state);
    const applied = applyOverrides(demo);
    const { password: _pw, ...user } = applied;
    return user;
  }
  return null;
}

/** Admin workflow: change an account's role. */
export function setRole(email: string, role: Role): SessionUser | null {
  const key = email.trim().toLowerCase();
  const state = load();
  const entry = state.entries.find((e) => e.email === key);
  if (entry) {
    entry.role = role;
    save(state);
    return toSessionUser(entry);
  }
  const demo = DEMO_ACCOUNTS.find((a) => a.email === key);
  if (demo) {
    state.overrides[key] = { ...state.overrides[key], role };
    save(state);
    const applied = applyOverrides(demo);
    const { password: _pw, ...user } = applied;
    return user;
  }
  return null;
}

/** Every account known to the demo system, with overrides applied. */
export function listAllAccounts(): SessionUser[] {
  const state = load();
  const registered = state.entries.map(toSessionUser);
  const registeredEmails = new Set(registered.map((u) => u.email));
  const demo = DEMO_ACCOUNTS.filter((a) => !registeredEmails.has(a.email))
    .map(applyOverrides)
    .map(({ password: _pw, ...user }) => user);
  return [...demo, ...registered];
}
