import "server-only";
import type { CtaConfig } from "@prisma/client";
import { prisma } from "@/lib/db";
import { pick } from "@/lib/i18n";
import type { AppLocale } from "@/types/locale";
import type { CtaDTO } from "@/types/cms";

/**
 * Centralized CTA resolution. Maps a CtaConfig record's actionType to a final
 * href + external flag for the given locale. This is the ONLY place CTA targets
 * are resolved (no duplicate CTA logic elsewhere).
 */
export function resolveCta(cta: CtaConfig | null, locale: AppLocale): CtaDTO | null {
  if (!cta || !cta.isActive) return null;

  const contactHref = `/${locale}/contact`;
  let href = contactHref;
  let external = false;

  switch (cta.actionType) {
    case "OPEN_LEAD_FORM":
      // Prefer an in-page lead form anchor; fall back to the contact page.
      href = "#lead-form";
      external = false;
      break;
    case "OPEN_CONTACT_PAGE":
      href = contactHref;
      external = false;
      break;
    case "OPEN_CALENDLY":
      href = cta.calendlyUrl ?? process.env.CALENDLY_URL ?? contactHref;
      external = Boolean(cta.calendlyUrl ?? process.env.CALENDLY_URL);
      break;
    case "OPEN_CALCOM":
      href = cta.calcomUrl ?? process.env.CALCOM_URL ?? contactHref;
      external = Boolean(cta.calcomUrl ?? process.env.CALCOM_URL);
      break;
    case "INTERNAL_URL":
      href = normalizeInternal(cta.internalUrl, locale, contactHref);
      external = false;
      break;
    case "EXTERNAL_URL":
      href = cta.externalUrl ?? contactHref;
      external = Boolean(cta.externalUrl);
      break;
    case "DOWNLOAD_ASSET":
      href = cta.assetUrl ?? contactHref;
      external = Boolean(cta.assetUrl);
      break;
  }

  return {
    id: cta.id,
    label: pick(cta, "label", locale),
    actionType: cta.actionType,
    href,
    external,
  };
}

function normalizeInternal(
  internalUrl: string | null,
  locale: AppLocale,
  fallback: string,
): string {
  if (!internalUrl) return fallback;
  if (/^https?:\/\//.test(internalUrl)) return internalUrl;
  if (internalUrl.startsWith("#")) return internalUrl;
  const path = internalUrl.startsWith("/") ? internalUrl : `/${internalUrl}`;
  // Avoid double-prefixing an existing locale segment.
  if (path === `/${locale}` || path.startsWith(`/${locale}/`)) return path;
  return `/${locale}${path}`;
}

/** Resolve a CTA by id (used where only the FK is available). */
export async function resolveCtaById(
  ctaId: string | null,
  locale: AppLocale,
): Promise<CtaDTO | null> {
  if (!ctaId) return null;
  const cta = await prisma.ctaConfig.findUnique({ where: { id: ctaId } });
  return resolveCta(cta, locale);
}

/** Resolve a CTA by its unique internalName (e.g. the header "book-consultation"). */
export async function resolveCtaByName(
  internalName: string,
  locale: AppLocale,
): Promise<CtaDTO | null> {
  const cta = await prisma.ctaConfig.findUnique({ where: { internalName } });
  return resolveCta(cta, locale);
}

// ---- Admin raw fetchers / CRUD --------------------------------------------

export async function listCtas() {
  return prisma.ctaConfig.findMany({ orderBy: { internalName: "asc" } });
}

export async function getCta(id: string) {
  return prisma.ctaConfig.findUnique({ where: { id } });
}

export async function createCta(data: {
  internalName: string;
  label_en: string;
  label_fa: string;
  actionType: CtaConfig["actionType"];
  internalUrl?: string | null;
  externalUrl?: string | null;
  calendlyUrl?: string | null;
  calcomUrl?: string | null;
  assetUrl?: string | null;
  isActive?: boolean;
}) {
  return prisma.ctaConfig.create({ data });
}

export async function updateCta(
  id: string,
  data: Partial<{
    internalName: string;
    label_en: string;
    label_fa: string;
    actionType: CtaConfig["actionType"];
    internalUrl: string | null;
    externalUrl: string | null;
    calendlyUrl: string | null;
    calcomUrl: string | null;
    assetUrl: string | null;
    isActive: boolean;
  }>,
) {
  return prisma.ctaConfig.update({ where: { id }, data });
}

export async function deleteCta(id: string) {
  return prisma.ctaConfig.delete({ where: { id } });
}
