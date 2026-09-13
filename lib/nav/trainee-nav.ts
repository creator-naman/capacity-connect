import {
  LayoutDashboard,
  BookOpen,
  Compass,
  ClipboardCheck,
  UserRound,
  Award,
  MessageSquare,
} from "lucide-react";
import type { NavItem } from "@/lib/types/nav";

/**
 * Trainee navigation, section 9 of the product brief.
 * Sidebar (desktop) and MobileNav (mobile) both read this array so the
 * two surfaces never fall out of sync.
 */
export const TRAINEE_NAV: NavItem[] = [
  { label: "Dashboard", href: "/trainee/dashboard", icon: LayoutDashboard },
  { label: "My Learning", href: "/trainee/my-learning", icon: BookOpen },
  { label: "Explore Courses", href: "/trainee/explore", icon: Compass },
  { label: "Assessments", href: "/trainee/assessments", icon: ClipboardCheck },
  { label: "Profile", href: "/trainee/profile", icon: UserRound },
  { label: "Certificates", href: "/trainee/certificates", icon: Award },
  { label: "Feedback", href: "/trainee/feedback", icon: MessageSquare },
];

/**
 * Compact subset for the mobile bottom bar — the full 7-item set doesn't
 * fit comfortably at touch-target size, so this surfaces the items a
 * trainee reaches for most; the rest live in the mobile drawer.
 */
export const TRAINEE_NAV_MOBILE_PRIMARY: NavItem[] = [
  TRAINEE_NAV[0], // Dashboard
  TRAINEE_NAV[1], // My Learning
  TRAINEE_NAV[2], // Explore Courses
  TRAINEE_NAV[3], // Assessments
];
