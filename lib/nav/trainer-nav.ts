import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  FilePen,
  Users,
  ChartLine,
  UserRound,
} from "lucide-react";
import type { NavItem } from "@/lib/types/nav";

/**
 * Trainer navigation, section 10 of the product brief. Sidebar (desktop)
 * and MobileNav (mobile) both read this array so the two surfaces never
 * fall out of sync.
 */
export const TRAINER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/trainer/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/trainer/courses", icon: BookOpen },
  { label: "Library", href: "/trainer/library", icon: FolderOpen },
  { label: "Questionnaires", href: "/trainer/questionnaires", icon: FilePen },
  { label: "Trainees", href: "/trainer/trainees", icon: Users },
  { label: "Performance", href: "/trainer/performance", icon: ChartLine },
  { label: "Profile", href: "/trainer/profile", icon: UserRound },
];

/** Compact subset for the mobile bottom bar; the rest live in the drawer. */
export const TRAINER_NAV_MOBILE_PRIMARY: NavItem[] = [
  TRAINER_NAV[0], // Dashboard
  TRAINER_NAV[1], // My Courses
  TRAINER_NAV[4], // Trainees
  TRAINER_NAV[3], // Questionnaires
];
