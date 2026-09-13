import {
  LayoutDashboard,
  Users,
  BookOpen,
  Megaphone,
  Compass,
  ChartLine,
  ClipboardList,
  Award,
  FileText,
  Target,
  UserCog,
  Activity,
} from "lucide-react";
import type { NavItem } from "@/lib/types/nav";

/**
 * Admin navigation, section 11 of the product brief. Every oversight area
 * keeps its own route; the sidebar scrolls on shorter viewports and the
 * mobile drawer carries the full set.
 */
export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Trainers", href: "/admin/trainers", icon: UserCog },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Enrollments", href: "/admin/enrollments", icon: ClipboardList },
  { label: "Assessments", href: "/admin/assessments", icon: Activity },
  { label: "Certifications", href: "/admin/certifications", icon: Award },
  { label: "Participation", href: "/admin/participation", icon: ChartLine },
  { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { label: "Achievements", href: "/admin/achievements", icon: Target },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Competency Mapping", href: "/admin/competency-mapping", icon: Compass },
  { label: "Analytics", href: "/admin/analytics", icon: ChartLine },
];

export const ADMIN_NAV_MOBILE_PRIMARY: NavItem[] = [
  ADMIN_NAV[0], // Dashboard
  ADMIN_NAV[1], // Users
  ADMIN_NAV[3], // Courses
  ADMIN_NAV[8], // Announcements
];
