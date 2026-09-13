import { TRAINEE_NAV, TRAINEE_NAV_MOBILE_PRIMARY } from "./trainee-nav";
import { TRAINER_NAV, TRAINER_NAV_MOBILE_PRIMARY } from "./trainer-nav";
import { ADMIN_NAV, ADMIN_NAV_MOBILE_PRIMARY } from "./admin-nav";

/**
 * Client-side nav registry. Role layouts pass only a `navKey` string to
 * AppShell — nav configs hold Lucide icon components, which cannot cross
 * the server→client prop boundary, so the client shell resolves them here.
 */
export const NAV_CONFIGS = {
  trainee: {
    nav: TRAINEE_NAV,
    mobilePrimary: TRAINEE_NAV_MOBILE_PRIMARY,
    roleLabel: "IMD Learning Portal",
  },
  trainer: {
    nav: TRAINER_NAV,
    mobilePrimary: TRAINER_NAV_MOBILE_PRIMARY,
    roleLabel: "Trainer Workspace",
  },
  admin: {
    nav: ADMIN_NAV,
    mobilePrimary: ADMIN_NAV_MOBILE_PRIMARY,
    roleLabel: "Administration",
  },
} as const;

export type NavKey = keyof typeof NAV_CONFIGS;
