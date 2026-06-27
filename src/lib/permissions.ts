import type { Role } from "@prisma/client";

/**
 * Centralized RBAC. Permissions are checked server-side on every admin action.
 * Resource → required capability. ADMIN has everything; EDITOR has content/ops
 * but not users/settings; VIEWER is read-only.
 */
export type Capability = "read" | "create" | "update" | "delete" | "publish";

export type Resource =
  | "dashboard"
  | "pages"
  | "homepage"
  | "services"
  | "case-studies"
  | "testimonials"
  | "team"
  | "events"
  | "leads"
  | "media"
  | "menus"
  | "ctas"
  | "theme"
  | "seo"
  | "grades"
  | "users"
  | "audit-logs"
  | "settings";

const EDITOR_WRITE: Resource[] = [
  "pages",
  "homepage",
  "services",
  "case-studies",
  "testimonials",
  "team",
  "events",
  "leads",
  "media",
  "menus",
  "ctas",
  "theme",
  "seo",
  "grades",
];

const ADMIN_ONLY: Resource[] = ["users", "settings"];

export function can(role: Role, capability: Capability, resource: Resource): boolean {
  if (role === "ADMIN") return true;

  if (role === "VIEWER") {
    // Read-only everywhere except admin-only modules, which are fully hidden.
    return capability === "read" && !ADMIN_ONLY.includes(resource);
  }

  // EDITOR
  if (ADMIN_ONLY.includes(resource)) return false;
  if (capability === "read") return true;
  if (resource === "audit-logs") return false;
  // Editors can create/update/publish content & ops; delete limited to media/leads.
  if (capability === "delete") return resource === "media" || resource === "leads";
  return EDITOR_WRITE.includes(resource);
}

export function assertCan(role: Role, capability: Capability, resource: Resource): void {
  if (!can(role, capability, resource)) {
    throw new PermissionError(
      `Role ${role} cannot ${capability} ${resource}.`,
    );
  }
}

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}

export const NAV_RESOURCES: { resource: Resource; label: string }[] = [
  { resource: "dashboard", label: "Dashboard" },
  { resource: "pages", label: "Pages" },
  { resource: "homepage", label: "Homepage" },
  { resource: "services", label: "Services" },
  { resource: "case-studies", label: "Case Studies" },
  { resource: "testimonials", label: "Testimonials" },
  { resource: "team", label: "Team Members" },
  { resource: "events", label: "Events" },
  { resource: "leads", label: "Leads" },
  { resource: "media", label: "Media Library" },
  { resource: "menus", label: "Menus" },
  { resource: "ctas", label: "CTA Manager" },
  { resource: "theme", label: "Theme Manager" },
  { resource: "seo", label: "SEO" },
  { resource: "users", label: "Users" },
  { resource: "audit-logs", label: "Audit Logs" },
  { resource: "settings", label: "Settings" },
];
