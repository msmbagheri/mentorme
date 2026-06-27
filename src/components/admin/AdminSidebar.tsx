"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import {
  LayoutDashboard,
  FileText,
  Home,
  Briefcase,
  Trophy,
  Quote,
  Users,
  Calendar,
  Inbox,
  Image as ImageIcon,
  Menu as MenuIcon,
  MousePointerClick,
  Palette,
  Search,
  ShieldCheck,
  ScrollText,
  Settings,
} from "lucide-react";
import { can, NAV_RESOURCES, type Resource } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const ICONS: Record<Resource, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  pages: FileText,
  homepage: Home,
  services: Briefcase,
  "case-studies": Trophy,
  testimonials: Quote,
  team: Users,
  events: Calendar,
  leads: Inbox,
  media: ImageIcon,
  menus: MenuIcon,
  ctas: MousePointerClick,
  theme: Palette,
  seo: Search,
  grades: ShieldCheck,
  users: ShieldCheck,
  "audit-logs": ScrollText,
  settings: Settings,
};

const HREF: Record<Resource, string> = {
  dashboard: "/admin",
  pages: "/admin/pages",
  homepage: "/admin/homepage",
  services: "/admin/services",
  "case-studies": "/admin/case-studies",
  testimonials: "/admin/testimonials",
  team: "/admin/team",
  events: "/admin/events",
  leads: "/admin/leads",
  media: "/admin/media",
  menus: "/admin/menus",
  ctas: "/admin/ctas",
  theme: "/admin/theme",
  seo: "/admin/seo",
  grades: "/admin/settings",
  users: "/admin/users",
  "audit-logs": "/admin/audit-logs",
  settings: "/admin/settings",
};

export function AdminSidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  const items = NAV_RESOURCES.filter((n) => can(role, "read", n.resource));

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-e border-[var(--color-border)] bg-[var(--color-surface)] lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-[var(--color-border)] px-6">
        <span className="text-h4 font-bold text-gradient-logo">MentorMe</span>
        <span className="text-caption font-semibold text-[var(--color-text-muted)]">Admin</span>
      </div>
      <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const href = HREF[item.resource];
            const Icon = ICONS[item.resource];
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={item.resource}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-small font-medium transition-colors",
                    active
                      ? "bg-[var(--color-surface-alt)] text-[var(--brand-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]",
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
