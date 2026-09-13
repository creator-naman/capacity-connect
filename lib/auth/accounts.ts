import type { DemoAccount } from "./types";

/**
 * DEMO MODE — static account registry.
 *
 * These accounts back the demo login (password is public by design so
 * reviewers can sign in). When Supabase Auth is connected this file is
 * deleted outright: real accounts live in the `auth.users` table and the
 * pending/approval workflow moves behind RLS-guarded queries. Nothing in
 * the UI imports this file — only the server actions do.
 */
export const DEMO_PASSWORD = "demo1234";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "trn-1042",
    email: "ananya.verma@imd.demo",
    name: "Ananya Verma",
    initials: "AV",
    role: "trainee",
    status: "active",
    title: "Scientist-B, Regional Meteorological Centre",
    password: DEMO_PASSWORD,
  },
  {
    id: "trh-0201",
    email: "rajesh.iyer@imd.demo",
    name: "Dr. Rajesh Iyer",
    initials: "RI",
    role: "trainer",
    status: "active",
    title: "Senior Scientist, Numerical Weather Prediction",
    password: DEMO_PASSWORD,
  },
  {
    id: "adm-0301",
    email: "meera.nair@imd.demo",
    name: "Meera Nair",
    initials: "MN",
    role: "admin",
    status: "active",
    title: "Training Administrator, IMD Training Division",
    password: DEMO_PASSWORD,
  },
  {
    id: "trn-1087",
    email: "arjun.mehta@imd.demo",
    name: "Arjun Mehta",
    initials: "AM",
    role: "trainee",
    status: "pending",
    title: "Project Scientist, Atmospheric Sciences",
    password: DEMO_PASSWORD,
  },
  {
    id: "trh-0215",
    email: "vikram.rao@imd.demo",
    name: "Vikram Rao",
    initials: "VR",
    role: "trainer",
    status: "disabled",
    title: "Meteorologist-C, Cyclone Warning Division",
    password: DEMO_PASSWORD,
  },
];

export function findDemoAccount(email: string): DemoAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find((a) => a.email === normalized);
}
