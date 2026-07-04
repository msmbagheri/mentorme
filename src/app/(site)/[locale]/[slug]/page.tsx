import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type AppLocale } from "@/types/locale";
import { getHomepage, getRenderablePage } from "@/services/homepage.service";
import { buildPageMetadata, webPageLd, localeUrl } from "@/lib/seo";
import { JsonLd } from "@/components/site/JsonLd";
import { HomeSections } from "@/components/site/renderers/SectionRegistry";

// ISR: CMS pages are section-composed in the admin builder; revalidate on change.
export const revalidate = 60;

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) return {};
  const locale: AppLocale = rawLocale;
  const page = await getRenderablePage(slug);
  if (!page || page.status !== "PUBLISHED") return {};

  const title =
    (locale === "fa" ? page.meta_title_fa || page.title_fa : page.meta_title_en || page.title_en) ||
    slug;
  const description =
    (locale === "fa" ? page.meta_description_fa : page.meta_description_en) ?? undefined;

  return buildPageMetadata({
    title,
    description,
    locale,
    path: `/${slug}`,
    ogImage: page.ogImageUrl,
    noIndex: !page.isIndexed,
  });
}

/** Public renderer for admin-composed CMS pages (non-home, non-reserved slugs). */
export default async function CmsPage({ params }: { params: Params }) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: AppLocale = rawLocale;

  const page = await getRenderablePage(slug);
  if (!page || page.status !== "PUBLISHED") notFound();

  const homepage = await getHomepage(locale, slug);
  const name = (locale === "fa" ? page.title_fa : page.title_en) || slug;

  return (
    <>
      <JsonLd data={[webPageLd({ name, url: localeUrl(locale, `/${slug}`) })]} />
      <HomeSections homepage={homepage} />
    </>
  );
}
