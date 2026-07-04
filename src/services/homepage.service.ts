import "server-only";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { pick } from "@/lib/i18n";
import { resolveCta } from "@/services/cta.service";
import { record } from "@/services/audit.service";
import {
  toServiceCard,
  toCaseStudyCard,
  toEventCard,
} from "@/services/content.service";
import type { AppLocale } from "@/types/locale";
import type {
  HomepageDTO,
  SectionVisibility,
  SectionType,
  HeroDTO,
  WhyChooseUsDTO,
  BrandPhilosophyDTO,
  FounderMessageDTO,
  FinalCtaDTO,
  AsSeenInLogoDTO,
  MethodologyStepDTO,
  TestimonialDTO,
  ValuePropositionDTO,
  SuccessMetricDTO,
  TeamCategoryDTO,
  GradeOptionDTO,
} from "@/types/cms";
import { SECTION_ORDER } from "@/types/cms";

const HOME_SLUG = "home";

function defaultVisibility(): SectionVisibility {
  return SECTION_ORDER.reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {} as SectionVisibility);
}

// Non-home pages start with everything hidden — the admin opts sections in.
function hiddenVisibility(): SectionVisibility {
  return SECTION_ORDER.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as SectionVisibility);
}

/** Visibility map keyed by SectionType (admin toggles isActive; order is fixed). */
export async function getSectionVisibility(): Promise<SectionVisibility> {
  const visibility = defaultVisibility();
  const page = await prisma.page.findUnique({
    where: { slug: HOME_SLUG },
    select: { homepageSections: { select: { sectionType: true, isActive: true, isDeleted: true } } },
  });
  if (!page) return visibility;
  for (const section of page.homepageSections) {
    if ((SECTION_ORDER as string[]).includes(section.sectionType)) {
      visibility[section.sectionType as SectionType] = section.isActive && !section.isDeleted;
    }
  }
  return visibility;
}

// ---- Admin: homepage section visibility ------------------------------------

/** List a page's sections in fixed trust-flow order for the builder UI. */
export async function listHomepageSections(pageSlug: string = HOME_SLUG) {
  const isHome = pageSlug === HOME_SLUG;
  const page = await prisma.page.findUnique({
    where: { slug: pageSlug },
    select: { id: true, homepageSections: true },
  });
  const existing = new Map(
    (page?.homepageSections ?? []).map((s) => [s.sectionType, s]),
  );
  return SECTION_ORDER.map((type, idx) => {
    const row = existing.get(type);
    return {
      sectionType: type,
      orderIndex: idx,
      // Home defaults sections visible; other pages default hidden (opt-in).
      isActive: row ? row.isActive && !row.isDeleted : isHome,
      exists: Boolean(row),
      cardsPerRow: row?.cardsPerRow ?? 1,
      bgColor: row?.bgColor ?? "",
      textColor: row?.textColor ?? "",
      accentColor: row?.accentColor ?? "",
      header: {
        eyebrow_en: row?.eyebrow_en ?? "",
        eyebrow_fa: row?.eyebrow_fa ?? "",
        title_en: row?.title_en ?? "",
        title_fa: row?.title_fa ?? "",
        description_en: row?.description_en ?? "",
        description_fa: row?.description_fa ?? "",
      },
    };
  });
}

/** Header copy fields editable from the admin Homepage Builder. */
export interface SectionHeaderInput {
  eyebrow_en?: string | null;
  eyebrow_fa?: string | null;
  title_en?: string | null;
  title_fa?: string | null;
  description_en?: string | null;
  description_fa?: string | null;
  /** Section-level layout: cards per row (1 | 2 | 3 | 4). */
  cardsPerRow?: number | null;
  /** Per-section color overrides (hex or "" to clear). */
  bgColor?: string | null;
  textColor?: string | null;
  accentColor?: string | null;
}

function normalize(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Accept only a #RGB / #RRGGBB / #RRGGBBAA hex, else null. */
function normalizeHex(value: string | null | undefined): string | null {
  const v = normalize(value);
  return v && /^#[0-9a-fA-F]{3,8}$/.test(v) ? v : null;
}

/**
 * Update a homepage section's CMS header copy (eyebrow/title/description in
 * both locales). Upserts the row by pageId+sectionType, writes an audit log,
 * and revalidates both locale homepages.
 */
export async function updateSectionHeader(
  sectionType: string,
  input: SectionHeaderInput,
  audit?: {
    userId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  },
  pageSlug: string = HOME_SLUG,
) {
  if (!(SECTION_ORDER as string[]).includes(sectionType)) {
    throw new Error("Unknown section type.");
  }
  const page = await prisma.page.findUnique({
    where: { slug: pageSlug },
    select: { id: true },
  });
  if (!page) throw new Error("Page not found.");
  const orderIndex = (SECTION_ORDER as string[]).indexOf(sectionType);

  const cardsPerRow =
    input.cardsPerRow != null && [1, 2, 3, 4].includes(input.cardsPerRow)
      ? input.cardsPerRow
      : null;

  const data = {
    eyebrow_en: normalize(input.eyebrow_en),
    eyebrow_fa: normalize(input.eyebrow_fa),
    title_en: normalize(input.title_en),
    title_fa: normalize(input.title_fa),
    description_en: normalize(input.description_en),
    description_fa: normalize(input.description_fa),
    // Only touch cardsPerRow when a valid value was supplied, so a plain
    // header-copy save never resets the layout.
    ...(cardsPerRow != null ? { cardsPerRow } : {}),
    // Colors are only touched when the key is present (form sends them; a
    // header-only API call omits them). "" clears to null.
    ...(input.bgColor !== undefined ? { bgColor: normalizeHex(input.bgColor) } : {}),
    ...(input.textColor !== undefined ? { textColor: normalizeHex(input.textColor) } : {}),
    ...(input.accentColor !== undefined ? { accentColor: normalizeHex(input.accentColor) } : {}),
  };

  const section = await prisma.homepageSection.upsert({
    where: { pageId_sectionType: { pageId: page.id, sectionType } },
    update: data,
    create: {
      pageId: page.id,
      sectionType,
      stageGroup: "TRUST",
      orderIndex,
      isActive: true,
      ...data,
      cardsPerRow: cardsPerRow ?? 1,
    },
  });

  await record({
    userId: audit?.userId ?? null,
    action: "UPDATE",
    entityType: "HomepageSection",
    entityId: section.id,
    details: `Updated header copy for section ${sectionType}.`,
    ipAddress: audit?.ipAddress ?? null,
    userAgent: audit?.userAgent ?? null,
  });

  revalidateForPage(pageSlug);
  return section;
}

/** Revalidate a page's public routes (the home path, or /{locale}/{slug}). */
function revalidateForPage(pageSlug: string) {
  if (pageSlug === HOME_SLUG) {
    revalidatePath("/en");
    revalidatePath("/fa");
  } else {
    revalidatePath(`/en/${pageSlug}`);
    revalidatePath(`/fa/${pageSlug}`);
  }
}

/** Toggle a page section's visibility (enabling opts the section into the page). */
export async function setSectionActive(
  sectionType: string,
  isActive: boolean,
  pageSlug: string = HOME_SLUG,
) {
  const page = await prisma.page.findUnique({
    where: { slug: pageSlug },
    select: { id: true },
  });
  if (!page) throw new Error("Page not found.");
  if (!(SECTION_ORDER as string[]).includes(sectionType)) {
    throw new Error("Unknown section type.");
  }
  const orderIndex = (SECTION_ORDER as string[]).indexOf(sectionType);
  const section = await prisma.homepageSection.upsert({
    where: { pageId_sectionType: { pageId: page.id, sectionType } },
    update: { isActive, isDeleted: false },
    create: {
      pageId: page.id,
      sectionType,
      stageGroup: "TRUST",
      orderIndex,
      isActive,
    },
  });
  revalidateForPage(pageSlug);
  return section;
}

/** Slugs served by fixed routes — a CMS page must never shadow these. */
export const RESERVED_PAGE_SLUGS = new Set([
  "home",
  "contact",
  "services",
  "team",
  "case-studies",
  "events",
]);

/** Fetch a CMS page's render metadata by slug (null if absent/reserved). */
export async function getRenderablePage(slug: string) {
  if (RESERVED_PAGE_SLUGS.has(slug)) return null;
  return prisma.page.findUnique({
    where: { slug },
    select: {
      slug: true,
      status: true,
      isIndexed: true,
      title_en: true,
      title_fa: true,
      meta_title_en: true,
      meta_title_fa: true,
      meta_description_en: true,
      meta_description_fa: true,
      ogImageUrl: true,
    },
  });
}

/** Pages that can be composed in the section builder (excludes the homepage). */
export async function listBuilderPages() {
  const pages = await prisma.page.findMany({
    where: { slug: { not: HOME_SLUG } },
    select: { id: true, slug: true, title_en: true, title_fa: true, status: true },
    orderBy: { createdAt: "asc" },
  });
  return pages.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title_en || p.title_fa || p.slug,
    status: p.status,
  }));
}

async function getGradeOptions(locale: AppLocale): Promise<GradeOptionDTO[]> {
  const grades = await prisma.gradeOption.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return grades.map((g) => ({
    value: g.grade,
    label: pick(g, "label", locale),
    ctaLabel: pick(g, "ctaLabel", locale) || null,
    funnelMode: g.funnelMode,
  }));
}

/**
 * Assemble the localized section payload for a page (the homepage by default).
 * Shared content (services, testimonials, team, …) is global; the page only
 * controls which sections show, their order, per-section header copy + colors.
 */
export async function getHomepage(
  locale: AppLocale,
  pageSlug: string = HOME_SLUG,
): Promise<HomepageDTO> {
  const isHome = pageSlug === HOME_SLUG;
  const page = await prisma.page.findUnique({
    where: { slug: pageSlug },
    include: {
      homepageSections: true,
      heroSection: { include: { primaryCta: true, secondaryCta: true } },
      brandPhilosophy: { include: { cta: true } },
      founderMessage: true,
      finalCta: { include: { primaryCta: true, secondaryCta: true } },
      methodologySteps: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      successMetrics: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  // Home defaults every section visible; other pages start empty and opt in.
  const visibility = isHome ? defaultVisibility() : hiddenVisibility();
  const sectionHeaders: HomepageDTO["sectionHeaders"] = {};
  const sectionSettings: HomepageDTO["sectionSettings"] = {};
  // Section-level layout knobs read off HomepageSection (e.g. testimonials carousel columns).
  let testimonialsPerRow = 1;
  if (page) {
    for (const section of page.homepageSections) {
      if ((SECTION_ORDER as string[]).includes(section.sectionType)) {
        const type = section.sectionType as SectionType;
        visibility[type] = section.isActive && !section.isDeleted;
        sectionHeaders[type] = {
          eyebrow: pick(section, "eyebrow", locale) || null,
          title: pick(section, "title", locale) || null,
          description: pick(section, "description", locale) || null,
        };
        sectionSettings[type] = {
          cardsPerRow: section.cardsPerRow,
          bgColor: section.bgColor,
          textColor: section.textColor,
          accentColor: section.accentColor,
        };
      }
      if (section.sectionType === "why_choose_us") {
        testimonialsPerRow = section.cardsPerRow;
      }
    }
  }

  // Home keeps the fixed trust-flow order; other pages render their active
  // sections in the admin-defined orderIndex order.
  const sectionOrder: SectionType[] = isHome
    ? SECTION_ORDER
    : (page?.homepageSections ?? [])
        .filter(
          (s) =>
            (SECTION_ORDER as string[]).includes(s.sectionType) &&
            s.isActive &&
            !s.isDeleted,
        )
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((s) => s.sectionType as SectionType);

  const [
    grades,
    asSeenInRows,
    testimonials,
    valueProps,
    services,
    caseStudies,
    team,
    events,
  ] = await Promise.all([
    getGradeOptions(locale),
    prisma.asSeenInLogo.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    }),
    prisma.valueProposition.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
    prisma.service.findMany({
      where: { isActive: true, status: "PUBLISHED", isFeatured: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.caseStudy.findMany({
      where: { isActive: true, status: "PUBLISHED", isFeatured: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.teamCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        members: {
          where: { isActive: true, isFeatured: true },
          orderBy: { sortOrder: "asc" },
          include: { category: true },
        },
      },
    }),
    prisma.event.findMany({
      where: { eventStatus: "PUBLISHED" },
      orderBy: { startDate: "asc" },
      take: 6,
    }),
  ]);

  // ---- Hero ----
  const hero: HeroDTO | null = page?.heroSection
    ? {
        eyebrow: pick(page.heroSection, "eyebrow", locale) || null,
        headline: pick(page.heroSection, "headline", locale),
        subheadline: pick(page.heroSection, "subheadline", locale),
        imageUrl: page.heroSection.heroImageUrl,
        imageAlt: pick(page.heroSection, "heroImageAlt", locale) || null,
        trustBadge: pick(page.heroSection, "trustBadgeText", locale) || null,
        primaryCta: resolveCta(page.heroSection.primaryCta, locale),
        secondaryCta: resolveCta(page.heroSection.secondaryCta, locale),
        grades,
      }
    : null;

  // ---- As Seen In ----
  const asSeenIn: AsSeenInLogoDTO[] = asSeenInRows.map((l) => ({
    id: l.id,
    title: pick(l, "title", locale),
    imageUrl: l.imageUrl,
    alt: pick(l, "altText", locale) || pick(l, "title", locale) || null,
    url: l.url,
  }));

  // ---- Methodology ----
  const methodology: MethodologyStepDTO[] = (page?.methodologySteps ?? []).map((s) => ({
    id: s.id,
    stepNumber: s.stepNumber,
    icon: s.icon,
    title: pick(s, "title", locale),
    description: pick(s, "description", locale),
  }));

  // ---- Why Choose Us (testimonial + value props + aggregate rating) ----
  const featured = testimonials.find((t) => t.isFeatured) ?? testimonials[0] ?? null;
  const featuredTestimonial: TestimonialDTO | null = featured
    ? {
        id: featured.id,
        name: featured.name,
        role: pick(featured, "role", locale) || null,
        company: featured.company,
        content: pick(featured, "content", locale),
        rating: featured.rating,
        avatarUrl: featured.avatarUrl,
        avatarAlt: pick(featured, "avatarAlt", locale) || null,
      }
    : null;
  const reviewCount = testimonials.length;
  const averageRating =
    reviewCount > 0
      ? Math.round(
          (testimonials.reduce((sum, t) => sum + t.rating, 0) / reviewCount) * 10,
        ) / 10
      : 0;
  const testimonialsDTO: TestimonialDTO[] = testimonials.map((t) => ({
    id: t.id,
    name: t.name,
    role: pick(t, "role", locale) || null,
    company: t.company,
    content: pick(t, "content", locale),
    rating: t.rating,
    avatarUrl: t.avatarUrl,
    avatarAlt: pick(t, "avatarAlt", locale) || null,
  }));
  const valuePropsDTO: ValuePropositionDTO[] = valueProps.map((v) => ({
    id: v.id,
    icon: v.icon,
    title: pick(v, "title", locale),
    description: pick(v, "description", locale),
  }));
  const whyChooseUs: WhyChooseUsDTO = {
    featuredTestimonial,
    testimonials: testimonialsDTO,
    testimonialsPerRow,
    averageRating,
    reviewCount,
    valueProps: valuePropsDTO,
  };

  // ---- Brand Philosophy ----
  const brandPhilosophy: BrandPhilosophyDTO | null = page?.brandPhilosophy
    ? {
        eyebrow: pick(page.brandPhilosophy, "eyebrow", locale) || null,
        title: pick(page.brandPhilosophy, "title", locale),
        content: pick(page.brandPhilosophy, "content", locale),
        imageUrl: page.brandPhilosophy.imageUrl,
        imageAlt: pick(page.brandPhilosophy, "imageAlt", locale) || null,
        cta: resolveCta(page.brandPhilosophy.cta, locale),
      }
    : null;

  // ---- Founder ----
  const founderMessage: FounderMessageDTO | null = page?.founderMessage
    ? {
        name: pick(page.founderMessage, "name", locale),
        title: pick(page.founderMessage, "title", locale),
        message: pick(page.founderMessage, "message", locale),
        photoUrl: page.founderMessage.photoUrl,
        photoAlt: pick(page.founderMessage, "photoAlt", locale) || null,
        signatureUrl: page.founderMessage.signatureUrl,
      }
    : null;

  // ---- Final CTA ----
  const finalCta: FinalCtaDTO | null = page?.finalCta
    ? {
        eyebrow: pick(page.finalCta, "eyebrow", locale) || null,
        headline: pick(page.finalCta, "headline", locale),
        subheadline: pick(page.finalCta, "subheadline", locale) || null,
        trustStatement: pick(page.finalCta, "trustStatement", locale) || null,
        backgroundImageUrl: page.finalCta.backgroundImageUrl,
        primaryCta: resolveCta(page.finalCta.primaryCta, locale),
        secondaryCta: resolveCta(page.finalCta.secondaryCta, locale),
      }
    : null;

  // ---- Success metrics ----
  const successMetrics: SuccessMetricDTO[] = (page?.successMetrics ?? []).map((m) => ({
    id: m.id,
    value: m.metricValue,
    label: pick(m, "metricLabel", locale),
  }));

  // ---- Team (grouped, featured only) ----
  const teamDTO: TeamCategoryDTO[] = team
    .map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      title: pick(cat, "title", locale),
      members: cat.members.map((m) => ({
        id: m.id,
        slug: m.slug,
        name: pick(m, "name", locale),
        role: pick(m, "role", locale),
        bio: pick(m, "bio", locale),
        photoUrl: m.photoUrl,
        photoAlt: pick(m, "photoAlt", locale) || null,
        linkedinUrl: m.linkedinUrl,
        categorySlug: cat.slug,
        categoryTitle: pick(cat, "title", locale),
      })),
    }))
    .filter((cat) => cat.members.length > 0);

  return {
    locale,
    visibility,
    sectionOrder,
    sectionHeaders,
    sectionSettings,
    hero,
    asSeenIn,
    methodology,
    whyChooseUs,
    brandPhilosophy,
    services: services.map((s) => toServiceCard(s, locale)),
    successStories: caseStudies.map((c) => toCaseStudyCard(c, locale)),
    founderMessage,
    team: teamDTO,
    events: events.map((e) => toEventCard(e, locale)),
    finalCta,
    successMetrics,
  };
}
