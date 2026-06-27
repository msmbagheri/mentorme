import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { pick } from "@/lib/i18n";
import type { AppLocale } from "@/types/locale";
import type { SeoDTO } from "@/types/cms";

/**
 * Merge Page-level meta with its SeoSetting (SeoSetting wins where present).
 * Returns a localized SeoDTO for the given page slug.
 */
export async function getSeoForPage(slug: string, locale: AppLocale): Promise<SeoDTO> {
  const page = await prisma.page.findUnique({
    where: { slug },
    include: { seoSetting: true },
  });

  if (!page) {
    return {
      metaTitle: null,
      metaDescription: null,
      canonicalUrl: null,
      ogImageUrl: null,
      noIndex: false,
      noFollow: false,
    };
  }

  const seo = page.seoSetting;
  const seoTitle = seo ? pick(seo, "metaTitle", locale) : "";
  const pageMetaTitle = pick(page, "meta_title", locale);
  const pageTitle = pick(page, "title", locale);
  const seoDesc = seo ? pick(seo, "metaDescription", locale) : "";
  const pageDesc = pick(page, "meta_description", locale);

  return {
    metaTitle: seoTitle || pageMetaTitle || pageTitle || null,
    metaDescription: seoDesc || pageDesc || null,
    canonicalUrl: seo?.canonicalUrl ?? page.canonicalUrl ?? null,
    ogImageUrl: seo?.ogImageUrl ?? page.ogImageUrl ?? null,
    noIndex: seo ? seo.noIndex : !page.isIndexed,
    noFollow: seo?.noFollow ?? false,
  };
}

/** Raw structured-data JSON for a page (for JSON-LD injection). */
export async function getStructuredData(slug: string) {
  const seo = await prisma.seoSetting.findFirst({
    where: { page: { slug } },
    select: { structuredData: true },
  });
  return seo?.structuredData ?? null;
}

// ---- Admin raw fetchers / CRUD --------------------------------------------

export async function listSeoSettings() {
  return prisma.seoSetting.findMany({
    include: { page: { select: { slug: true, title_en: true, title_fa: true } } },
  });
}

export async function getSeoSettingByPageId(pageId: string) {
  return prisma.seoSetting.findUnique({ where: { pageId } });
}

export async function upsertSeoSetting(
  pageId: string,
  data: Omit<Prisma.SeoSettingUncheckedCreateInput, "pageId">,
) {
  return prisma.seoSetting.upsert({
    where: { pageId },
    update: data,
    create: { pageId, ...data },
  });
}
