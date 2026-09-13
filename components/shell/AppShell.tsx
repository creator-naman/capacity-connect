"use client";

import { useState, type ReactNode } from "react";
import { NAV_CONFIGS, type NavKey } from "@/lib/nav/registry";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { MobileDrawer } from "./MobileDrawer";

/**
 * Role-agnostic application frame. The role layout passes a `navKey`;
 * the nav config (with icon components) is resolved client-side from the
 * registry because component references cannot cross the server boundary.
 */
export function AppShell({
  children,
  topbar,
  navKey,
}: {
  children: ReactNode;
  topbar: ReactNode;
  navKey: NavKey;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { nav, mobilePrimary, roleLabel } = NAV_CONFIGS[navKey];

  return (
    <div className="flex min-h-dvh">
      <Sidebar nav={nav} roleLabel={roleLabel} />

      <div className="flex min-w-0 flex-1 flex-col">
        {topbar}

        <main className="flex-1 px-4 pb-20 pt-5 md:px-6 md:pb-8 md:pt-6">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>

      <MobileNav items={mobilePrimary} onOpenMore={() => setMoreOpen(true)} moreOpen={moreOpen} />
      <MobileDrawer items={nav} open={moreOpen} onClose={() => setMoreOpen(false)} />
    </div>
  );
}
