import "server-only";
import { revalidatePath } from "next/cache";
import type {
  Service,
  CaseStudy,
  TeamMember,
  TeamCategory,
  Event,
  ContentStatus,
  EventStatus,
  CtaConfig,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { pick } from "@/lib/i18n";
import { resolveCta } from "@/services/cta.service";
import { record } from "@/services/audit.service";
import type { AppLocale } from "@/types/locale";
import type {
  ServiceCardDTO,
  ServiceDetailDTO,
  CaseStudyCardDTO,
  CaseStudyDetailDTO,
  TeamMemberCardDTO,
  TeamMemberDetailDTO,
  TeamCategoryDTO,
  EventCardDTO,
  EventDetailDTO,
} from "@/types/cms";

type ServiceWithCta = Service & { cta: CtaConfig | null };
type CaseStudyWithCta = CaseStudy & { cta: CtaConfig | null };
type TeamMemberWithCategory = TeamMember & { category: TeamCategory };
type EventWithCta = Event & { cta: CtaConfig | null };

// ============================================================
// DTO MAPPERS
// ============================================================

export function toServiceCard(s: Service, locale: AppLocale): ServiceCardDTO {
  return {
    id: s.id,
    slug: s.slug,
    title: pick(s, "title", locale),
    shortDescription: pick(s, "shortDescription", locale),
    imageUrl: s.imageUrl,
    imageAlt: pick(s, "imageAlt", locale) || null,
  };
}

function toServiceDetail(s: ServiceWithCta, locale: AppLocale): ServiceDetailDTO {
  return {
    ...toServiceCard(s, locale),
    fullDescription: pick(s, "fullDescription", locale),
    cta: resolveCta(s.cta, locale),
    metaTitle: pick(s, "metaTitle", locale) || null,
    metaDescription: pick(s, "metaDescription", locale) || null,
  };
}

export function toCaseStudyCard(c: CaseStudy, locale: AppLocale): CaseStudyCardDTO {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    title: pick(c, "title", locale),
    outcomeBadge: pick(c, "outcomeBadge", locale),
    story: pick(c, "story", locale),
    university: c.university,
    imageUrl: c.imageUrl,
    imageAlt: pick(c, "imageAlt", locale) || null,
  };
}

function toCaseStudyDetail(c: CaseStudyWithCta, locale: AppLocale): CaseStudyDetailDTO {
  return {
    ...toCaseStudyCard(c, locale),
    fullStory: pick(c, "fullStory", locale) || null,
    cta: resolveCta(c.cta, locale),
    metaTitle: pick(c, "metaTitle", locale) || null,
    metaDescription: pick(c, "metaDescription", locale) || null,
  };
}

function parseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export function toTeamMemberCard(
  m: TeamMemberWithCategory,
  locale: AppLocale,
): TeamMemberCardDTO {
  return {
    id: m.id,
    slug: m.slug,
    name: pick(m, "name", locale),
    role: pick(m, "role", locale),
    bio: pick(m, "bio", locale),
    photoUrl: m.photoUrl,
    photoAlt: pick(m, "photoAlt", locale) || null,
    linkedinUrl: m.linkedinUrl,
    categorySlug: m.category.slug,
    categoryTitle: pick(m.category, "title", locale),
  };
}

function toTeamMemberDetail(
  m: TeamMemberWithCategory,
  locale: AppLocale,
): TeamMemberDetailDTO {
  return {
    ...toTeamMemberCard(m, locale),
    fullBio: pick(m, "fullBio", locale) || null,
    email: m.email,
    location: m.location,
    specialtyTags: parseTags(m.specialtyTags),
  };
}

export function toEventCard(e: Event, locale: AppLocale): EventCardDTO {
  return {
    id: e.id,
    slug: e.slug,
    title: pick(e, "title", locale),
    shortDescription: pick(e, "shortDescription", locale),
    imageUrl: e.imageUrl,
    imageAlt: pick(e, "imageAlt", locale) || null,
    location: pick(e, "location", locale) || null,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate ? e.endDate.toISOString() : null,
    timezone: e.timezone,
  };
}

function toEventDetail(e: EventWithCta, locale: AppLocale): EventDetailDTO {
  return {
    ...toEventCard(e, locale),
    content: pick(e, "content", locale),
    capacity: e.capacity,
    registrationUrl: e.registrationUrl,
    cta: resolveCta(e.cta, locale),
    metaTitle: pick(e, "metaTitle", locale) || null,
    metaDescription: pick(e, "metaDescription", locale) || null,
  };
}

// ============================================================
// PUBLIC LIST + DETAIL GETTERS (localized DTOs)
// ============================================================

export async function listServices(locale: AppLocale): Promise<ServiceCardDTO[]> {
  const rows = await prisma.service.findMany({
    where: { isActive: true, status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map((s) => toServiceCard(s, locale));
}

export async function getService(
  slug: string,
  locale: AppLocale,
): Promise<ServiceDetailDTO | null> {
  const s = await prisma.service.findUnique({ where: { slug }, include: { cta: true } });
  if (!s || !s.isActive || s.status !== "PUBLISHED") return null;
  return toServiceDetail(s, locale);
}

export async function getRelatedServices(
  currentId: string,
  locale: AppLocale,
  limit = 3,
): Promise<ServiceCardDTO[]> {
  const rows = await prisma.service.findMany({
    where: { isActive: true, status: "PUBLISHED", id: { not: currentId } },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    take: limit,
  });
  return rows.map((s) => toServiceCard(s, locale));
}

export async function listCaseStudies(locale: AppLocale): Promise<CaseStudyCardDTO[]> {
  const rows = await prisma.caseStudy.findMany({
    where: { isActive: true, status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map((c) => toCaseStudyCard(c, locale));
}

export async function getCaseStudy(
  slug: string,
  locale: AppLocale,
): Promise<CaseStudyDetailDTO | null> {
  const c = await prisma.caseStudy.findUnique({ where: { slug }, include: { cta: true } });
  if (!c || !c.isActive || c.status !== "PUBLISHED") return null;
  return toCaseStudyDetail(c, locale);
}

export async function getRelatedCaseStudies(
  currentId: string,
  locale: AppLocale,
  limit = 3,
): Promise<CaseStudyCardDTO[]> {
  const rows = await prisma.caseStudy.findMany({
    where: { isActive: true, status: "PUBLISHED", id: { not: currentId } },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    take: limit,
  });
  return rows.map((c) => toCaseStudyCard(c, locale));
}

/** Team grouped by category, each with ordered active members. */
export async function listTeam(locale: AppLocale): Promise<TeamCategoryDTO[]> {
  const categories = await prisma.teamCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      members: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: { category: true },
      },
    },
  });
  return categories
    .map((cat) => ({
      id: cat.id,
      slug: cat.slug,
      title: pick(cat, "title", locale),
      members: cat.members.map((m) => toTeamMemberCard(m, locale)),
    }))
    .filter((cat) => cat.members.length > 0);
}

export async function getTeamMember(
  slug: string,
  locale: AppLocale,
): Promise<TeamMemberDetailDTO | null> {
  const m = await prisma.teamMember.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!m || !m.isActive) return null;
  return toTeamMemberDetail(m, locale);
}

export async function getRelatedTeamMembers(
  currentId: string,
  categoryId: string,
  locale: AppLocale,
  limit = 3,
): Promise<TeamMemberCardDTO[]> {
  const rows = await prisma.teamMember.findMany({
    where: { isActive: true, categoryId, id: { not: currentId } },
    orderBy: { sortOrder: "asc" },
    take: limit,
    include: { category: true },
  });
  return rows.map((m) => toTeamMemberCard(m, locale));
}

/** Published events; upcoming or currently-active first. */
export async function listEvents(locale: AppLocale): Promise<EventCardDTO[]> {
  const now = new Date();
  const rows = await prisma.event.findMany({
    where: {
      eventStatus: "PUBLISHED",
      OR: [{ endDate: { gte: now } }, { endDate: null, startDate: { gte: now } }, { startDate: { gte: now } }],
    },
    orderBy: { startDate: "asc" },
  });
  return rows.map((e) => toEventCard(e, locale));
}

export async function listAllPublishedEvents(locale: AppLocale): Promise<EventCardDTO[]> {
  const rows = await prisma.event.findMany({
    where: { eventStatus: "PUBLISHED" },
    orderBy: { startDate: "desc" },
  });
  return rows.map((e) => toEventCard(e, locale));
}

export async function getEvent(
  slug: string,
  locale: AppLocale,
): Promise<EventDetailDTO | null> {
  const e = await prisma.event.findUnique({ where: { slug }, include: { cta: true } });
  if (!e || e.eventStatus !== "PUBLISHED") return null;
  return toEventDetail(e, locale);
}

export async function getRelatedEvents(
  currentId: string,
  locale: AppLocale,
  limit = 3,
): Promise<EventCardDTO[]> {
  const now = new Date();
  const rows = await prisma.event.findMany({
    where: { eventStatus: "PUBLISHED", id: { not: currentId }, startDate: { gte: now } },
    orderBy: { startDate: "asc" },
    take: limit,
  });
  return rows.map((e) => toEventCard(e, locale));
}

// ============================================================
// ADMIN RAW FETCHERS (bilingual records for editing)
// ============================================================

export async function listPagesRaw() {
  return prisma.page.findMany({
    orderBy: { slug: "asc" },
    include: { seoSetting: { select: { id: true } } },
  });
}
export async function getPageRaw(id: string) {
  return prisma.page.findUnique({ where: { id } });
}
export async function getTestimonialRaw(id: string) {
  return prisma.testimonial.findUnique({ where: { id } });
}

export async function listServicesRaw() {
  return prisma.service.findMany({ orderBy: { sortOrder: "asc" } });
}
export async function getServiceRaw(id: string) {
  return prisma.service.findUnique({ where: { id }, include: { cta: true } });
}

export async function listCaseStudiesRaw() {
  return prisma.caseStudy.findMany({ orderBy: { sortOrder: "asc" } });
}
export async function getCaseStudyRaw(id: string) {
  return prisma.caseStudy.findUnique({ where: { id }, include: { cta: true } });
}

export async function listTeamCategoriesRaw() {
  return prisma.teamCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { members: { orderBy: { sortOrder: "asc" } } },
  });
}
export async function listTeamMembersRaw() {
  return prisma.teamMember.findMany({
    orderBy: { sortOrder: "asc" },
    include: { category: true },
  });
}
export async function getTeamMemberRaw(id: string) {
  return prisma.teamMember.findUnique({ where: { id }, include: { category: true } });
}

export async function listEventsRaw() {
  return prisma.event.findMany({ orderBy: { startDate: "desc" } });
}
export async function getEventRaw(id: string) {
  return prisma.event.findUnique({ where: { id }, include: { cta: true, registrations: true } });
}

export async function listTestimonialsRaw() {
  return prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
}
export async function listValuePropsRaw() {
  return prisma.valueProposition.findMany({ orderBy: { sortOrder: "asc" } });
}
export async function listMethodologyStepsRaw() {
  return prisma.methodologyStep.findMany({ orderBy: { sortOrder: "asc" } });
}
export async function listSuccessMetricsRaw() {
  return prisma.successMetric.findMany({ orderBy: { sortOrder: "asc" } });
}
export async function listAsSeenInLogosRaw() {
  return prisma.asSeenInLogo.findMany({ orderBy: { sortOrder: "asc" } });
}

/** The homepage Page id — repeatable homepage sections (steps, metrics) need it on create. */
export async function getHomepagePageId() {
  const page = await prisma.page.findUnique({ where: { slug: "home" }, select: { id: true } });
  return page?.id ?? null;
}

// Homepage singleton sections (one row each, tied to the homepage Page).
export async function getHeroRaw() {
  return prisma.heroSection.findFirst();
}
export async function getBrandPhilosophyRaw() {
  return prisma.brandPhilosophy.findFirst();
}
export async function getFounderMessageRaw() {
  return prisma.founderMessage.findFirst();
}
export async function getFinalCtaRaw() {
  return prisma.finalCta.findFirst();
}
export async function getFooterSettingRaw() {
  return prisma.footerSetting.findFirst();
}

// ============================================================
// GENERIC CONTENT CRUD (admin) — by entityType string
// ============================================================

/**
 * Versioned content entities. Each maps an entityType to its Prisma delegate.
 * Keys are the canonical model names used in ContentVersion.entityType.
 */
const ENTITY_DELEGATES = {
  Service: () => prisma.service,
  CaseStudy: () => prisma.caseStudy,
  TeamMember: () => prisma.teamMember,
  TeamCategory: () => prisma.teamCategory,
  Event: () => prisma.event,
  Testimonial: () => prisma.testimonial,
  ValueProposition: () => prisma.valueProposition,
  MethodologyStep: () => prisma.methodologyStep,
  HeroSection: () => prisma.heroSection,
  BrandPhilosophy: () => prisma.brandPhilosophy,
  FounderMessage: () => prisma.founderMessage,
  FinalCta: () => prisma.finalCta,
  FooterSetting: () => prisma.footerSetting,
  SuccessMetric: () => prisma.successMetric,
  AsSeenInLogo: () => prisma.asSeenInLogo,
  Page: () => prisma.page,
} as const;

export type ContentEntityType = keyof typeof ENTITY_DELEGATES;

export function isContentEntityType(value: string): value is ContentEntityType {
  return value in ENTITY_DELEGATES;
}

function delegateFor(entityType: ContentEntityType) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ENTITY_DELEGATES[entityType]() as any;
}

/**
 * Entities that surface on the ISR homepage (`/en`, `/fa`). Any create/update/
 * delete on these must invalidate the homepage cache so the public site reflects
 * the change immediately instead of waiting out the 60s revalidate window.
 */
const HOMEPAGE_ENTITIES = new Set<ContentEntityType>([
  "HeroSection",
  "AsSeenInLogo",
  "MethodologyStep",
  "Testimonial",
  "ValueProposition",
  "BrandPhilosophy",
  "SuccessMetric",
  "FounderMessage",
  "FinalCta",
  "FooterSetting",
  "Service",
  "CaseStudy",
  "TeamMember",
  "TeamCategory",
  "Event",
]);

/** Revalidate every public path affected by a mutation on this entity type. */
function revalidateForEntity(entityType: ContentEntityType) {
  if (HOMEPAGE_ENTITIES.has(entityType)) {
    revalidatePath("/en");
    revalidatePath("/fa");
  }
  for (const path of PUBLISH_REVALIDATE_PATHS[entityType] ?? []) revalidatePath(path);
}

export async function createContent(
  entityType: ContentEntityType,
  data: Record<string, unknown>,
  userId?: string | null,
) {
  const delegate = delegateFor(entityType);
  const created = await delegate.create({ data });
  await createVersion(entityType, created.id, created, userId);
  revalidateForEntity(entityType);
  return created;
}

export async function updateContent(
  entityType: ContentEntityType,
  id: string,
  data: Record<string, unknown>,
  userId?: string | null,
) {
  const delegate = delegateFor(entityType);
  const updated = await delegate.update({ where: { id }, data });
  await createVersion(entityType, id, updated, userId);
  revalidateForEntity(entityType);
  return updated;
}

export async function deleteContent(entityType: ContentEntityType, id: string) {
  const delegate = delegateFor(entityType);
  const result = await delegate.delete({ where: { id } });
  revalidateForEntity(entityType);
  return result;
}

export async function getContent(entityType: ContentEntityType, id: string) {
  const delegate = delegateFor(entityType);
  return delegate.findUnique({ where: { id } });
}

// ============================================================
// VERSIONING
// ============================================================

export async function createVersion(
  entityType: string,
  entityId: string,
  payload: unknown,
  userId?: string | null,
) {
  const last = await prisma.contentVersion.findFirst({
    where: { entityType, entityId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const version = (last?.version ?? 0) + 1;
  return prisma.contentVersion.create({
    data: {
      entityType,
      entityId,
      version,
      payload: payload as Prisma.InputJsonValue,
      createdBy: userId ?? null,
    },
  });
}

export async function listVersions(entityType: string, entityId: string) {
  return prisma.contentVersion.findMany({
    where: { entityType, entityId },
    orderBy: { version: "desc" },
  });
}

export async function rollback(
  entityType: ContentEntityType,
  entityId: string,
  version: number,
  userId?: string | null,
) {
  const snapshot = await prisma.contentVersion.findUnique({
    where: { entityType_entityId_version: { entityType, entityId, version } },
  });
  if (!snapshot) throw new Error(`Version ${version} not found for ${entityType}:${entityId}`);

  const payload = snapshot.payload as Record<string, unknown>;
  // Strip immutable/auto fields before restoring.
  const { id, createdAt, updatedAt, ...rest } = payload;
  void id;
  void createdAt;
  void updatedAt;

  const delegate = delegateFor(entityType);
  const restored = await delegate.update({ where: { id: entityId }, data: rest });

  // Preserve history: write a NEW version representing the post-rollback state.
  await createVersion(entityType, entityId, restored, userId);

  await record({
    userId,
    action: "ROLLBACK",
    entityType,
    entityId,
    details: `Rolled back ${entityType} ${entityId} to version ${version}.`,
  });

  return restored;
}

// ============================================================
// PUBLISH
// ============================================================

const PUBLISH_REVALIDATE_PATHS: Partial<Record<ContentEntityType, string[]>> = {
  Service: ["/en/services", "/fa/services"],
  CaseStudy: ["/en/case-studies", "/fa/case-studies"],
  TeamMember: ["/en/team", "/fa/team"],
  TeamCategory: ["/en/team", "/fa/team"],
  Event: ["/en/events", "/fa/events"],
};

/** Publish a content entity: set status, snapshot, audit, revalidate. */
export async function publishEntity(
  entityType: ContentEntityType,
  entityId: string,
  userId?: string | null,
) {
  const delegate = delegateFor(entityType);
  const isEvent = entityType === "Event";
  const statusData = isEvent
    ? { eventStatus: "PUBLISHED" as EventStatus }
    : { status: "PUBLISHED" as ContentStatus };

  let published;
  try {
    published = await delegate.update({ where: { id: entityId }, data: statusData });
  } catch {
    // Entity has no status column (e.g. homepage content fragments) — just snapshot.
    published = await delegate.findUnique({ where: { id: entityId } });
  }

  await createVersion(entityType, entityId, published, userId);
  await record({
    userId,
    action: "PUBLISH",
    entityType,
    entityId,
    details: `Published ${entityType} ${entityId}.`,
  });

  for (const path of PUBLISH_REVALIDATE_PATHS[entityType] ?? []) revalidatePath(path);
  revalidatePath("/en");
  revalidatePath("/fa");

  return published;
}

export async function archiveEntity(
  entityType: ContentEntityType,
  entityId: string,
  userId?: string | null,
) {
  const delegate = delegateFor(entityType);
  const isEvent = entityType === "Event";
  const statusData = isEvent
    ? { eventStatus: "ARCHIVED" as EventStatus }
    : { status: "ARCHIVED" as ContentStatus };

  let archived;
  try {
    archived = await delegate.update({ where: { id: entityId }, data: statusData });
  } catch {
    archived = await delegate.update({ where: { id: entityId }, data: { isActive: false } });
  }

  await createVersion(entityType, entityId, archived, userId);
  await record({
    userId,
    action: "ARCHIVE",
    entityType,
    entityId,
    details: `Archived ${entityType} ${entityId}.`,
  });

  for (const path of PUBLISH_REVALIDATE_PATHS[entityType] ?? []) revalidatePath(path);
  revalidatePath("/en");
  revalidatePath("/fa");

  return archived;
}
