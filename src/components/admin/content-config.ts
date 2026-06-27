import type { Resource } from "@/lib/permissions";

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "bilingual-text"
  | "bilingual-textarea"
  | "media"
  | "cta"
  | "number"
  | "date"
  | "switch"
  | "tags"
  | "url"
  | "email"
  | "select";

export interface FieldDef {
  /** Base name. For bilingual fields the editor appends _en/_fa. */
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  options?: { value: string; label: string }[];
  tab?: "content" | "media" | "seo" | "settings";
}

export interface ContentModuleConfig {
  entityType: string;
  resource: Resource;
  /** Singular + plural human labels. */
  singular: string;
  plural: string;
  /** Base route segment under /admin. */
  route: string;
  /** Column getter keys for the list table. */
  listColumns: { key: string; label: string; bilingualBase?: string }[];
  fields: FieldDef[];
  /** True if this entity uses eventStatus instead of status. */
  eventStatus?: boolean;
  /** Whether the entity has a publish workflow (status field). */
  hasWorkflow: boolean;
  hasFeatured?: boolean;
  hasActive?: boolean;
}

const SEO_FIELDS: FieldDef[] = [
  { name: "metaTitle", label: "Meta title", type: "bilingual-text", tab: "seo" },
  { name: "metaDescription", label: "Meta description", type: "bilingual-textarea", tab: "seo" },
];

export const CONTENT_MODULES: Record<string, ContentModuleConfig> = {
  services: {
    entityType: "Service",
    resource: "services",
    singular: "Service",
    plural: "Services",
    route: "services",
    hasWorkflow: true,
    hasFeatured: true,
    hasActive: true,
    listColumns: [
      { key: "title", label: "Title", bilingualBase: "title" },
      { key: "slug", label: "Slug" },
    ],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true, tab: "content" },
      { name: "title", label: "Title", type: "bilingual-text", required: true, tab: "content" },
      {
        name: "shortDescription",
        label: "Short description",
        type: "bilingual-textarea",
        required: true,
        tab: "content",
      },
      {
        name: "fullDescription",
        label: "Full description",
        type: "bilingual-textarea",
        required: true,
        tab: "content",
      },
      { name: "imageUrl", label: "Image", type: "media", tab: "media" },
      { name: "imageAlt", label: "Image alt text", type: "bilingual-text", tab: "media" },
      { name: "ctaId", label: "Call to action", type: "cta", tab: "settings" },
      { name: "sortOrder", label: "Sort order", type: "number", tab: "settings" },
      ...SEO_FIELDS,
    ],
  },
  "case-studies": {
    entityType: "CaseStudy",
    resource: "case-studies",
    singular: "Case Study",
    plural: "Case Studies",
    route: "case-studies",
    hasWorkflow: true,
    hasFeatured: true,
    hasActive: true,
    listColumns: [
      { key: "name", label: "Student" },
      { key: "title", label: "Title", bilingualBase: "title" },
    ],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true, tab: "content" },
      { name: "name", label: "Student name", type: "text", required: true, tab: "content" },
      { name: "title", label: "Title", type: "bilingual-text", required: true, tab: "content" },
      {
        name: "outcomeBadge",
        label: "Outcome badge",
        type: "bilingual-text",
        required: true,
        tab: "content",
      },
      { name: "story", label: "Story", type: "bilingual-textarea", required: true, tab: "content" },
      { name: "fullStory", label: "Full story", type: "bilingual-textarea", tab: "content" },
      { name: "university", label: "University", type: "text", tab: "content" },
      { name: "imageUrl", label: "Photo", type: "media", tab: "media" },
      { name: "imageAlt", label: "Photo alt text", type: "bilingual-text", tab: "media" },
      { name: "ctaId", label: "Call to action", type: "cta", tab: "settings" },
      { name: "sortOrder", label: "Sort order", type: "number", tab: "settings" },
      ...SEO_FIELDS,
    ],
  },
  testimonials: {
    entityType: "Testimonial",
    resource: "testimonials",
    singular: "Testimonial",
    plural: "Testimonials",
    route: "testimonials",
    hasWorkflow: false,
    hasFeatured: true,
    hasActive: true,
    listColumns: [
      { key: "name", label: "Name" },
      { key: "company", label: "Company" },
      { key: "rating", label: "Rating" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, tab: "content" },
      { name: "role", label: "Role", type: "bilingual-text", tab: "content" },
      { name: "company", label: "Company", type: "text", tab: "content" },
      { name: "content", label: "Quote", type: "bilingual-textarea", required: true, tab: "content" },
      {
        name: "rating",
        label: "Rating (1–5)",
        type: "number",
        tab: "content",
      },
      { name: "avatarUrl", label: "Avatar", type: "media", tab: "media" },
      { name: "avatarAlt", label: "Avatar alt text", type: "bilingual-text", tab: "media" },
      { name: "sortOrder", label: "Sort order", type: "number", tab: "settings" },
    ],
  },
  team: {
    entityType: "TeamMember",
    resource: "team",
    singular: "Team Member",
    plural: "Team Members",
    route: "team",
    hasWorkflow: false,
    hasFeatured: true,
    hasActive: true,
    listColumns: [
      { key: "name", label: "Name", bilingualBase: "name" },
      { key: "role", label: "Role", bilingualBase: "role" },
    ],
    fields: [
      { name: "categoryId", label: "Category", type: "select", required: true, tab: "content" },
      { name: "slug", label: "Slug", type: "text", required: true, tab: "content" },
      { name: "name", label: "Name", type: "bilingual-text", required: true, tab: "content" },
      { name: "role", label: "Role", type: "bilingual-text", required: true, tab: "content" },
      { name: "bio", label: "Short bio", type: "bilingual-textarea", required: true, tab: "content" },
      { name: "fullBio", label: "Full bio", type: "bilingual-textarea", tab: "content" },
      { name: "photoUrl", label: "Photo", type: "media", tab: "media" },
      { name: "photoAlt", label: "Photo alt text", type: "bilingual-text", tab: "media" },
      { name: "linkedinUrl", label: "LinkedIn URL", type: "url", tab: "settings" },
      { name: "email", label: "Email", type: "email", tab: "settings" },
      { name: "location", label: "Location", type: "text", tab: "settings" },
      { name: "specialtyTags", label: "Specialty tags", type: "tags", tab: "settings" },
      { name: "sortOrder", label: "Sort order", type: "number", tab: "settings" },
    ],
  },
  pages: {
    entityType: "Page",
    resource: "pages",
    singular: "Page",
    plural: "Pages",
    route: "pages",
    hasWorkflow: true,
    hasFeatured: false,
    hasActive: false,
    listColumns: [
      { key: "title", label: "Title", bilingualBase: "title" },
      { key: "slug", label: "Slug" },
    ],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true, tab: "content" },
      { name: "title", label: "Title", type: "bilingual-text", required: true, tab: "content" },
      { name: "meta_title", label: "Meta title", type: "bilingual-text", tab: "seo" },
      { name: "meta_description", label: "Meta description", type: "bilingual-textarea", tab: "seo" },
      { name: "canonicalUrl", label: "Canonical URL", type: "url", tab: "seo" },
      { name: "ogImageUrl", label: "OG image", type: "media", tab: "seo" },
      {
        name: "isIndexed",
        label: "Indexable",
        type: "switch",
        tab: "settings",
        hint: "Allow search engines to index this page.",
      },
    ],
  },
  events: {
    entityType: "Event",
    resource: "events",
    singular: "Event",
    plural: "Events",
    route: "events",
    hasWorkflow: true,
    eventStatus: true,
    hasFeatured: true,
    hasActive: false,
    listColumns: [
      { key: "title", label: "Title", bilingualBase: "title" },
      { key: "startDate", label: "Date" },
    ],
    fields: [
      { name: "slug", label: "Slug", type: "text", required: true, tab: "content" },
      { name: "title", label: "Title", type: "bilingual-text", required: true, tab: "content" },
      {
        name: "shortDescription",
        label: "Short description",
        type: "bilingual-textarea",
        required: true,
        tab: "content",
      },
      { name: "content", label: "Content", type: "bilingual-textarea", required: true, tab: "content" },
      { name: "location", label: "Location", type: "bilingual-text", tab: "content" },
      { name: "startDate", label: "Start date", type: "date", required: true, tab: "settings" },
      { name: "endDate", label: "End date", type: "date", tab: "settings" },
      { name: "timezone", label: "Timezone", type: "text", tab: "settings" },
      { name: "capacity", label: "Capacity", type: "number", tab: "settings" },
      { name: "registrationUrl", label: "Registration URL", type: "url", tab: "settings" },
      { name: "registrationCtaId", label: "Registration CTA", type: "cta", tab: "settings" },
      { name: "imageUrl", label: "Image", type: "media", tab: "media" },
      { name: "imageAlt", label: "Image alt text", type: "bilingual-text", tab: "media" },
      ...SEO_FIELDS,
    ],
  },
};

export function moduleByRoute(route: string): ContentModuleConfig | undefined {
  return CONTENT_MODULES[route];
}
