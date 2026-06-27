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

/** List homepage sections in fixed trust-flow order for the builder UI. */
export async function listHomepageSections() {
  const page = await prisma.page.findUnique({
    where: { slug: HOME_SLUG },
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
      isActive: row ? row.isActive && !row.isDeleted : true,
      exists: Boolean(row),
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
}

function normalize(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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
) {
  if (!(SECTION_ORDER as string[]).includes(sectionType)) {
    throw new Error("Unknown section type.");
  }
  const page = await prisma.page.findUnique({
    where: { slug: HOME_SLUG },
    select: { id: true },
  });
  if (!page) throw new Error("Homepage not found.");
  const orderIndex = (SECTION_ORDER as string[]).indexOf(sectionType);

  const data = {
    eyebrow_en: normalize(input.eyebrow_en),
    eyebrow_fa: normalize(input.eyebrow_fa),
    title_en: normalize(input.title_en),
    title_fa: normalize(input.title_fa),
    description_en: normalize(input.description_en),
    description_fa: normalize(input.description_fa),
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

  revalidatePath("/en");
  revalidatePath("/fa");
  return section;
}

/** Toggle a homepage section's visibility (order is fixed and never changes). */
export async function setSectionActive(sectionType: string, isActive: boolean) {
  const page = await prisma.page.findUnique({
    where: { slug: HOME_SLUG },
    select: { id: true },
  });
  if (!page) throw new Error("Homepage not found.");
  if (!(SECTION_ORDER as string[]).includes(sectionType)) {
    throw new Error("Unknown section type.");
  }
  const orderIndex = (SECTION_ORDER as string[]).indexOf(sectionType);
  return prisma.homepageSection.upsert({
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

/** Assemble the full, localized homepage payload for RSC rendering. */
export async function getHomepage(locale: AppLocale): Promise<HomepageDTO> {
  const page = await prisma.page.findUnique({
    where: { slug: HOME_SLUG },
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

  const visibility = defaultVisibility();
  const sectionHeaders: HomepageDTO["sectionHeaders"] = {};
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
      }
    }
  }

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
  const valuePropsDTO: ValuePropositionDTO[] = valueProps.map((v) => ({
    id: v.id,
    icon: v.icon,
    title: pick(v, "title", locale),
    description: pick(v, "description", locale),
  }));
  const whyChooseUs: WhyChooseUsDTO = {
    featuredTestimonial,
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
    sectionHeaders,
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
