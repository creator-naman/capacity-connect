"use client";

import Link from "next/link";
import { Search, Bell, LogOut } from "lucide-react";
import { GlassSurface } from "@/components/ui/GlassSurface";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { signOut } from "@/lib/auth/actions";
import type { SessionUser } from "@/lib/auth/types";

/**
 * Authenticated chrome. `searchHref` routes the search to the most useful
 * listing page for the current role (trainee → explore, trainer → courses,
 * admin → users).
 */
export function Topbar({
  user,
  searchHref,
  notificationsHref = "/trainee/notifications",
}: {
  user: SessionUser;
  searchHref?: string;
  notificationsHref?: string;
}) {
  return (
    <GlassSurface
      as="header"
      className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 md:px-6"
    >
      <label className="relative ml-auto flex w-full max-w-sm items-center md:ml-0">
        <Search
          size={16}
          strokeWidth={1.75}
          className="pointer-events-none absolute left-3 text-ink-muted"
        />
        <input
          type="search"
          name="q"
          placeholder="Search courses, resources..."
          aria-label="Search"
          className="h-9 w-full rounded-[var(--radius-sm)] border border-border bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary"
          onKeyDown={(event) => {
            if (!searchHref || event.key !== "Enter") return;
            const value = (event.target as HTMLInputElement).value.trim();
            // Plain navigation keeps the topbar a server component.
            window.location.assign(
              value ? `${searchHref}?q=${encodeURIComponent(value)}` : searchHref
            );
          }}
        />
      </label>

      <div className="ml-auto flex items-center gap-2 md:ml-4 md:gap-3">
        <ThemeToggle />

        <Link
          href={notificationsHref}
          title="Notifications"
          aria-label="Notifications"
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-ink-secondary hover:bg-surface-sunken hover:text-ink"
        >
          <Bell size={18} strokeWidth={1.75} />
        </Link>

        <form action={signOut}>
          <button
            type="submit"
            title="Sign out"
            aria-label="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-ink-secondary hover:bg-surface-sunken hover:text-ink"
          >
            <LogOut size={18} strokeWidth={1.75} />
          </button>
        </form>

        <div className="flex items-center gap-2.5 border-l border-border pl-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
            {user.initials}
          </span>
          <div className="hidden leading-tight lg:block">
            <p className="text-sm font-medium text-ink">{user.name}</p>
            <p className="text-xs text-ink-muted">{user.title}</p>
          </div>
        </div>
      </div>
    </GlassSurface>
  );
}
