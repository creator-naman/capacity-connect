"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/types/nav";

interface NavLinkProps {
  item: NavItem;
  variant?: "sidebar" | "bottom" | "drawer";
  onNavigate?: () => void;
}

export function NavLink({ item, variant = "sidebar", onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  if (variant === "bottom") {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
          isActive ? "text-primary" : "text-ink-muted"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon size={20} strokeWidth={isActive ? 2.25 : 1.75} />
        {item.label === "Explore Courses" ? "Explore" : item.label}
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors duration-150",
        isActive
          ? "bg-primary-soft text-primary"
          : "text-ink-secondary hover:bg-surface-sunken hover:text-ink"
      )}
    >
      <Icon size={18} strokeWidth={isActive ? 2.25 : 1.75} />
      {item.label}
    </Link>
  );
}
