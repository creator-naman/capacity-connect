import type { LucideIcon } from "lucide-react";

export type Role = "trainee" | "trainer" | "admin";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}
