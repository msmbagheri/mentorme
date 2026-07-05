import { z } from "zod";

// Shared primitives ----------------------------------------------------------
const slug = z
  .string()
  .min(1, "Slug is required.")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens.");
const optStr = z.string().max(2000).optional().or(z.literal("")).nullable();
const optShort = z.string().max(300).optional().or(z.literal("")).nullable();
// Accepts a full http(s) URL OR an uploaded-media reference — and only the two
// media paths the app actually serves (/uploads/… or /api/media/file/…), not an
// arbitrary relative string. A strict .url() would reject every image-bearing
// update because forms resend the existing relative image path on save.
const MEDIA_PATH = /^\/(uploads|api\/media\/file)\//;
const isUrlOrMediaPath = (v: string) =>
  v === "" || /^https?:\/\//i.test(v) || MEDIA_PATH.test(v);
const url = z
  .string()
  .max(500)
  .refine(isUrlOrMediaPath, "Enter a full URL or pick an uploaded file.")
  .optional()
  .or(z.literal(""))
  .nullable();
const requiredMediaUrl = z
  .string()
  .min(1)
  .max(500)
  .refine(isUrlOrMediaPath, "Enter a full URL or pick an uploaded file.");
const cuid = z.string().uuid();

const CONTENT_STATUS = ["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"] as const;
const EVENT_STATUS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

const withId = <T extends z.ZodRawShape>(shape: T) =>
  z.object({ id: cuid, ...shape });

// SERVICE --------------------------------------------------------------------
export const serviceCreateSchema = z.object({
  slug,
  title_en: z.string().min(1).max(160),
  title_fa: z.string().min(1).max(160),
  shortDescription_en: z.string().min(1).max(600),
  shortDescription_fa: z.string().min(1).max(600),
  fullDescription_en: z.string().min(1),
  fullDescription_fa: z.string().min(1),
  imageUrl: url,
  imageAlt_en: optShort,
  imageAlt_fa: optShort,
  ctaId: cuid.optional().nullable(),
  metaTitle_en: optShort,
  metaTitle_fa: optShort,
  metaDescription_en: optStr,
  metaDescription_fa: optStr,
  status: z.enum(CONTENT_STATUS).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
export const serviceUpdateSchema = withId(serviceCreateSchema.partial().shape);

// CASE STUDY -----------------------------------------------------------------
export const caseStudyCreateSchema = z.object({
  slug,
  name: z.string().min(1).max(160),
  title_en: z.string().min(1).max(200),
  title_fa: z.string().min(1).max(200),
  outcomeBadge_en: z.string().min(1).max(120),
  outcomeBadge_fa: z.string().min(1).max(120),
  story_en: z.string().min(1),
  story_fa: z.string().min(1),
  fullStory_en: optStr,
  fullStory_fa: optStr,
  university: optShort,
  imageUrl: url,
  imageAlt_en: optShort,
  imageAlt_fa: optShort,
  ctaId: cuid.optional().nullable(),
  metaTitle_en: optShort,
  metaTitle_fa: optShort,
  metaDescription_en: optStr,
  metaDescription_fa: optStr,
  status: z.enum(CONTENT_STATUS).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
export const caseStudyUpdateSchema = withId(caseStudyCreateSchema.partial().shape);

// TEAM CATEGORY --------------------------------------------------------------
export const teamCategoryCreateSchema = z.object({
  slug,
  title_en: z.string().min(1).max(120),
  title_fa: z.string().min(1).max(120),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});
export const teamCategoryUpdateSchema = withId(teamCategoryCreateSchema.partial().shape);

// TEAM MEMBER ----------------------------------------------------------------
export const teamMemberCreateSchema = z.object({
  categoryId: cuid,
  slug,
  name_en: z.string().min(1).max(160),
  name_fa: z.string().min(1).max(160),
  role_en: z.string().min(1).max(160),
  role_fa: z.string().min(1).max(160),
  bio_en: z.string().min(1),
  bio_fa: z.string().min(1),
  fullBio_en: optStr,
  fullBio_fa: optStr,
  photoUrl: url,
  photoAlt_en: optShort,
  photoAlt_fa: optShort,
  linkedinUrl: url,
  email: z.string().email().optional().or(z.literal("")).nullable(),
  location: optShort,
  specialtyTags: z.array(z.string().max(60)).optional(),
  isFeatured: z.boolean().default(true),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
export const teamMemberUpdateSchema = withId(teamMemberCreateSchema.partial().shape);

// EVENT ----------------------------------------------------------------------
export const eventCreateSchema = z.object({
  slug,
  title_en: z.string().min(1).max(200),
  title_fa: z.string().min(1).max(200),
  shortDescription_en: z.string().min(1).max(600),
  shortDescription_fa: z.string().min(1).max(600),
  content_en: z.string().min(1),
  content_fa: z.string().min(1),
  imageUrl: url,
  imageAlt_en: optShort,
  imageAlt_fa: optShort,
  location_en: optShort,
  location_fa: optShort,
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  timezone: optShort,
  registrationUrl: url,
  registrationCtaId: cuid.optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  eventStatus: z.enum(EVENT_STATUS).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  metaTitle_en: optShort,
  metaTitle_fa: optShort,
  metaDescription_en: optStr,
  metaDescription_fa: optStr,
});
export const eventUpdateSchema = withId(eventCreateSchema.partial().shape);

// TESTIMONIAL ----------------------------------------------------------------
export const testimonialCreateSchema = z.object({
  name: z.string().min(1).max(160),
  role_en: optShort,
  role_fa: optShort,
  company: optShort,
  content_en: z.string().min(1),
  content_fa: z.string().min(1),
  rating: z.number().int().min(1).max(5).default(5),
  avatarUrl: url,
  avatarAlt_en: optShort,
  avatarAlt_fa: optShort,
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});
export const testimonialUpdateSchema = withId(testimonialCreateSchema.partial().shape);

// VALUE PROPOSITION ----------------------------------------------------------
export const valuePropCreateSchema = z.object({
  icon: optShort,
  title_en: z.string().min(1).max(160),
  title_fa: z.string().min(1).max(160),
  description_en: z.string().min(1),
  description_fa: z.string().min(1),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});
export const valuePropUpdateSchema = withId(valuePropCreateSchema.partial().shape);

// METHODOLOGY STEP -----------------------------------------------------------
export const methodologyStepCreateSchema = z.object({
  pageId: cuid,
  stepNumber: z.number().int().min(1).default(1),
  icon: optShort,
  title_en: z.string().min(1).max(160),
  title_fa: z.string().min(1).max(160),
  description_en: z.string().min(1),
  description_fa: z.string().min(1),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});
export const methodologyStepUpdateSchema = withId(
  methodologyStepCreateSchema.partial().shape,
);

// HERO -----------------------------------------------------------------------
export const heroCreateSchema = z.object({
  pageId: cuid,
  eyebrow_en: optShort,
  eyebrow_fa: optShort,
  headline_en: z.string().min(1).max(240),
  headline_fa: z.string().min(1).max(240),
  subheadline_en: z.string().min(1),
  subheadline_fa: z.string().min(1),
  primaryCtaId: cuid.optional().nullable(),
  secondaryCtaId: cuid.optional().nullable(),
  heroImageUrl: url,
  heroImageAlt_en: optShort,
  heroImageAlt_fa: optShort,
  trustBadgeText_en: optShort,
  trustBadgeText_fa: optShort,
  isActive: z.boolean().default(true),
});
export const heroUpdateSchema = withId(heroCreateSchema.partial().shape);

// BRAND PHILOSOPHY -----------------------------------------------------------
export const brandPhilosophyCreateSchema = z.object({
  pageId: cuid,
  eyebrow_en: optShort,
  eyebrow_fa: optShort,
  title_en: z.string().min(1).max(240),
  title_fa: z.string().min(1).max(240),
  content_en: z.string().min(1),
  content_fa: z.string().min(1),
  imageUrl: url,
  imageAlt_en: optShort,
  imageAlt_fa: optShort,
  ctaId: cuid.optional().nullable(),
  isActive: z.boolean().default(true),
});
export const brandPhilosophyUpdateSchema = withId(
  brandPhilosophyCreateSchema.partial().shape,
);

// FOUNDER --------------------------------------------------------------------
export const founderCreateSchema = z.object({
  pageId: cuid,
  name_en: z.string().min(1).max(160),
  name_fa: z.string().min(1).max(160),
  title_en: z.string().min(1).max(160),
  title_fa: z.string().min(1).max(160),
  message_en: z.string().min(1),
  message_fa: z.string().min(1),
  photoUrl: url,
  photoAlt_en: optShort,
  photoAlt_fa: optShort,
  signatureUrl: url,
  isActive: z.boolean().default(true),
});
export const founderUpdateSchema = withId(founderCreateSchema.partial().shape);

// FINAL CTA ------------------------------------------------------------------
export const finalCtaCreateSchema = z.object({
  pageId: cuid,
  eyebrow_en: optShort,
  eyebrow_fa: optShort,
  headline_en: z.string().min(1).max(240),
  headline_fa: z.string().min(1).max(240),
  subheadline_en: optStr,
  subheadline_fa: optStr,
  trustStatement_en: optShort,
  trustStatement_fa: optShort,
  primaryCtaId: cuid.optional().nullable(),
  secondaryCtaId: cuid.optional().nullable(),
  backgroundImageUrl: url,
  isActive: z.boolean().default(true),
});
export const finalCtaUpdateSchema = withId(finalCtaCreateSchema.partial().shape);

// FOOTER ---------------------------------------------------------------------
export const footerCreateSchema = z.object({
  pageId: cuid.optional().nullable(),
  tagline_en: optShort,
  tagline_fa: optShort,
  description_en: optStr,
  description_fa: optStr,
  copyright_en: optShort,
  copyright_fa: optShort,
  address_en: optStr,
  address_fa: optStr,
  contactEmail: z.string().email().optional().or(z.literal("")).nullable(),
  contactPhone: optShort,
  businessHours_en: optShort,
  businessHours_fa: optShort,
  socialLinks: z
    .array(z.object({ platform: z.string().min(1), url: z.string().url() }))
    .optional(),
  footerMenuId: cuid.optional().nullable(),
  // "Related services" column: optional menu driving the links + editable heading.
  servicesMenuId: cuid.optional().nullable(),
  servicesHeading_en: optShort,
  servicesHeading_fa: optShort,
  isActive: z.boolean().default(true),
});
export const footerUpdateSchema = withId(footerCreateSchema.partial().shape);

// AS SEEN IN -----------------------------------------------------------------
export const asSeenInCreateSchema = z.object({
  title_en: z.string().min(1).max(160),
  title_fa: optShort,
  imageUrl: requiredMediaUrl,
  altText_en: optShort,
  altText_fa: optShort,
  url: url,
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});
export const asSeenInUpdateSchema = withId(asSeenInCreateSchema.partial().shape);

// SUCCESS METRIC -------------------------------------------------------------
export const successMetricCreateSchema = z.object({
  pageId: cuid,
  metricValue: z.string().min(1).max(40),
  metricLabel_en: z.string().min(1).max(160),
  metricLabel_fa: z.string().min(1).max(160),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});
export const successMetricUpdateSchema = withId(
  successMetricCreateSchema.partial().shape,
);

// PAGE -----------------------------------------------------------------------
export const pageCreateSchema = z.object({
  slug,
  title_en: z.string().min(1).max(200),
  title_fa: z.string().min(1).max(200),
  meta_title_en: optShort,
  meta_title_fa: optShort,
  meta_description_en: optStr,
  meta_description_fa: optStr,
  ogImageUrl: url,
  canonicalUrl: url,
  status: z.enum(CONTENT_STATUS).default("DRAFT"),
  isIndexed: z.boolean().default(true),
});
export const pageUpdateSchema = withId(pageCreateSchema.partial().shape);

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
export type CaseStudyCreateInput = z.infer<typeof caseStudyCreateSchema>;
export type TeamMemberCreateInput = z.infer<typeof teamMemberCreateSchema>;
export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type TestimonialCreateInput = z.infer<typeof testimonialCreateSchema>;
