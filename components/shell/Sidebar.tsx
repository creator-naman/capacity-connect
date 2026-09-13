import { CloudSun } from "lucide-react";
import type { NavItem } from "@/lib/types/nav";
import { NavLink } from "./NavLink";
import { GlassSurface } from "@/components/ui/GlassSurface";

export function Sidebar({
  nav,
  roleLabel,
}: {
  nav: NavItem[];
  roleLabel: string;
}) {
  return (
    <GlassSurface
      as="aside"
      className="hidden md:flex md:w-60 md:flex-col md:border-r md:px-3 md:py-5"
    >
      <div className="flex items-center gap-2 px-2 pb-6">
        <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-primary text-ink-inverted">
          <CloudSun size={18} strokeWidth={2} />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-ink">Capacity Connect</p>
          <p className="text-xs text-ink-muted">{roleLabel}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5" aria-label={roleLabel}>
        {nav.map((item) => (
          <NavLink key={item.href} item={item} variant="sidebar" />
        ))}
      </nav>
    </GlassSurface>
  );
}
