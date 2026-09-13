"use client";

import { MoreHorizontal } from "lucide-react";
import type { NavItem } from "@/lib/types/nav";
import { NavLink } from "./NavLink";
import { GlassSurface } from "@/components/ui/GlassSurface";
import { cn } from "@/lib/utils";

export function MobileNav({
  items,
  onOpenMore,
  moreOpen,
}: {
  items: NavItem[];
  onOpenMore: () => void;
  moreOpen: boolean;
}) {
  return (
    <GlassSurface
      as="nav"
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {items.map((item) => (
        <NavLink key={item.href} item={item} variant="bottom" />
      ))}
      <button
        type="button"
        onClick={onOpenMore}
        aria-expanded={moreOpen}
        aria-label="More sections"
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
          moreOpen ? "text-primary" : "text-ink-muted"
        )}
      >
        <MoreHorizontal size={20} strokeWidth={moreOpen ? 2.25 : 1.75} />
        More
      </button>
    </GlassSurface>
  );
}
