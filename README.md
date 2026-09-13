# CAPACITY CONNECT

A digital capacity building and learning management portal for the India
Meteorological Department (IMD) — Smart India Hackathon 2026, problem
statement SIH 26075 (Ministry of Earth Sciences / IMD, Smart Education).

One role-based application: public website → signup/login → role detection →
Trainee / Trainer / Admin workspaces, with connected workflows (publish →
enroll → learn → assess → certify) and light/dark theming.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # eslint
npx tsc --noEmit   # typecheck
npm run build      # production build
```

Demo accounts (password `demo1234`): `ananya.verma@imd.demo` (trainee),
`rajesh.iyer@imd.demo` (trainer), `meera.nair@imd.demo` (admin), plus a
pending and a disabled account for approval-flow testing.

## Modes

| | DEMO MODE (default) | REAL SUPABASE MODE |
|---|---|---|
| Activation | nothing to configure | set both env vars below |
| Auth | HMAC-signed cookie sessions | Supabase Auth (email confirmation, recovery, persistent sessions) |
| Accounts | disk-backed registry (`.data/registry.json`) | `profiles` table, admin-managed role/status |
| Roles | server-enforced via `requireRole` | same guards, session from Supabase |
| Content | browser-side shared catalog (localStorage) | PostgreSQL via RLS |
| Files | real local disk storage (`./demo-uploads`) | private `resources` bucket |

## Supabase setup (when a project is available)

1. `cp .env.example .env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (both public-by-design; RLS is the gate).
2. Run `supabase/migrations/0001_init.sql` in the SQL editor. It creates the
   schema (profiles, courses, modules, resources, enrollments, assessments,
   questions, quiz_results, feedback, certificates, questionnaires,
   questionnaire_responses, notifications, announcements, achievements,
   competencies), the Row Level Security policies, and the private
   `resources` storage bucket.
3. Restart the dev server. Signup now creates real Supabase users that start
   **pending** — an admin activates them and assigns roles from /admin/users.
   Users can never self-assign admin (the signup trigger ignores client
   roles; column grants keep role/status admin-only).

No Supabase credentials? The app stays in demo mode by design — nothing is
simulated to look real.

## Security notes

- Role authorization is enforced server-side in `requireRole` (role layouts),
  never by hiding navigation. Admin mutations re-verify the caller's session
  server-side.
- The anon key is the only credential the client ever sees. The service-role
  key is deliberately unused anywhere in this codebase.
- Uploads are validated twice (client + server): extension allow-list,
  MIME consistency, 25 MB cap, server-generated storage keys. Downloads
  require an active session and are served with `no-store` + `nosniff`.
- See `.env.example` for the public vs server-only variable contract.
