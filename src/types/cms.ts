import type { AppLocale } from "./locale";

/**
 * PUBLIC DTOs — already localized for a single `AppLocale` by the service layer
 * (Database → Service → DTO → Zod → RSC → Renderer). UI components consume these
 * and never touch Prisma. Admin screens use the raw Prisma records instead.
 */

export type SectionType =
  | "hero"
  | "as_seen_in"
  | "methodology"
  | "why_choose_us"
  | "brand_philosophy"
  | "services"
  | "success_stories"
  | "founder_message"
  | "team"
  | "events"
  | "final_cta"
  | "footer";

export const SECTION_ORDER: SectionType[] = [
  "hero",
  "as_seen_in",
  "methodology",
  "why_choose_us",
  "brand_philosophy",
  "services",
  "success_stories",
  "founder_message",
  "team",
  "events",
  "final_cta",
  "footer",
];

/** A CTA resolved to a final behavior + href for the current locale. */
export interface CtaDTO {
  id: string;
  label: string;
  actionType:
    | "OPEN_LEAD_FORM"
    | "OPEN_CONTACT_PAGE"
    | "OPEN_CALENDLY"
    | "OPEN_CALCOM"
    | "INTERNAL_URL"
    | "EXTERNAL_URL"
    | "DOWNLOAD_ASSET";
  href: string;
  external: boolean;
}

export interface HeroDTO {
  eyebrow: string | null;
  headline: string;
  subheadline: string;
  imageUrl: string | null;
  imageAlt: string | null;
  trustBadge: string | null;
  primaryCta: CtaDTO | null;
  secondaryCta: CtaDTO | null;
  grades: GradeOptionDTO[];
}

export interface GradeOptionDTO {
  value: string; // GradeLevel enum value
  label: string;
  ctaLabel: string | null;
  funnelMode: string | null;
}

export interface AsSeenInLogoDTO {
  id: string;
  title: string;
  imageUrl: string;
  alt: string | null;
  url: string | null;
}

export interface MethodologyStepDTO {
  id: string;
  stepNumber: number;
  icon: string | null;
  title: string;
  description: string;
}

export interface TestimonialDTO {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number;
  avatarUrl: string | null;
  avatarAlt: string | null;
}

export interface ValuePropositionDTO {
  id: string;
  icon: string | null;
  title: string;
  description: string;
}

export interface WhyChooseUsDTO {
  featuredTestimonial: TestimonialDTO | null;
  averageRating: number;
  reviewCount: number;
  valueProps: ValuePropositionDTO[];
}

export interface BrandPhilosophyDTO {
  eyebrow: string | null;
  title: string;
  content: string;
  imageUrl: string | null;
  imageAlt: string | null;
  cta: CtaDTO | null;
}

export interface SuccessMetricDTO {
  id: string;
  value: string;
  label: string;
}

export interface FounderMessageDTO {
  name: string;
  title: string;
  message: string;
  photoUrl: string | null;
  photoAlt: string | null;
  signatureUrl: string | null;
}

export interface FinalCtaDTO {
  eyebrow: string | null;
  headline: string;
  subheadline: string | null;
  trustStatement: string | null;
  backgroundImageUrl: string | null;
  primaryCta: CtaDTO | null;
  secondaryCta: CtaDTO | null;
}

export interface ServiceCardDTO {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  imageUrl: string | null;
  imageAlt: string | null;
}

export interface ServiceDetailDTO extends ServiceCardDTO {
  fullDescription: string;
  cta: CtaDTO | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface CaseStudyCardDTO {
  id: string;
  slug: string;
  name: string;
  title: string;
  outcomeBadge: string;
  story: string;
  university: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}

export interface CaseStudyDetailDTO extends CaseStudyCardDTO {
  fullStory: string | null;
  cta: CtaDTO | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface TeamMemberCardDTO {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string | null;
  photoAlt: string | null;
  linkedinUrl: string | null;
  categorySlug: string;
  categoryTitle: string;
}

export interface TeamMemberDetailDTO extends TeamMemberCardDTO {
  fullBio: string | null;
  email: string | null;
  location: string | null;
  specialtyTags: string[];
}

export interface TeamCategoryDTO {
  id: string;
  slug: string;
  title: string;
  members: TeamMemberCardDTO[];
}

export interface EventCardDTO {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  imageUrl: string | null;
  imageAlt: string | null;
  location: string | null;
  startDate: string; // ISO
  endDate: string | null;
  timezone: string | null;
}

export interface EventDetailDTO extends EventCardDTO {
  content: string;
  capacity: number | null;
  registrationUrl: string | null;
  cta: CtaDTO | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface MenuItemDTO {
  id: string;
  label: string;
  href: string;
  type: "SCROLL_TO_SECTION" | "INTERNAL_PAGE" | "EXTERNAL_URL";
  external: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  hours?: string;
}

export interface ThemeDTO {
  brandName: string;
  tagline: string;
  primaryLogoUrl: string | null;
  darkLogoUrl: string | null;
  mobileLogoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  ctaGradientStart: string | null;
  ctaGradientEnd: string | null;
  socialLinks: SocialLink[];
  contact: ContactInfo;
}

export interface FooterDTO {
  tagline: string | null;
  description: string | null;
  copyright: string | null;
  address: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  businessHours: string | null;
  socialLinks: SocialLink[];
  navItems: MenuItemDTO[];
  serviceLinks: { label: string; href: string }[];
}

export interface SeoDTO {
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  noIndex: boolean;
  noFollow: boolean;
}

/** Localized, CMS-driven header copy for a homepage section. */
export interface SectionHeaderDTO {
  eyebrow: string | null;
  title: string | null;
  description: string | null;
}

/** Whether a homepage section is enabled (CMS visibility). */
export type SectionVisibility = Record<SectionType, boolean>;

/** Full homepage payload assembled by homepage.service. */
export interface HomepageDTO {
  locale: AppLocale;
  visibility: SectionVisibility;
  sectionHeaders: Partial<Record<SectionType, SectionHeaderDTO>>;
  hero: HeroDTO | null;
  asSeenIn: AsSeenInLogoDTO[];
  methodology: MethodologyStepDTO[];
  whyChooseUs: WhyChooseUsDTO;
  brandPhilosophy: BrandPhilosophyDTO | null;
  services: ServiceCardDTO[];
  successStories: CaseStudyCardDTO[];
  founderMessage: FounderMessageDTO | null;
  team: TeamCategoryDTO[];
  events: EventCardDTO[];
  finalCta: FinalCtaDTO | null;
  successMetrics: SuccessMetricDTO[];
}
