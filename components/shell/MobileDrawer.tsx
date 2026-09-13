"use client";

import { X } from "lucide-react";
import type { NavItem } from "@/lib/types/nav";
import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";

export function MobileDrawer({
  items,
  open,
  onClose,
}: {
  items: NavItem[];
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-ink/30 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="All sections"
        className={cn(
          "absolute inset-x-0 bottom-0 rounded-t-[var(--radius-lg)] border-t border-border bg-surface p-4 pb-8",
          "transition-transform duration-200 ease-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-ink">All sections</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-[var(--radius-sm)] p-1.5 text-ink-muted hover:bg-surface-sunken hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex flex-col gap-0.5">
          {items.map((item) => (
            <NavLink key={item.href} item={item} variant="drawer" onNavigate={onClose} />
          ))}
        </nav>
      </div>
    </div>
  );
}
