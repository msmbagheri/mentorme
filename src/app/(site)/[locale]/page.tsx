import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type AppLocale } from "@/types/locale";
import { getHomepage } from "@/services/homepage.service";
import { getTheme } from "@/services/theme.service";
import { getSeoForPage } from "@/services/seo.service";
import {
  buildPageMetadata,
  organizationLd,
  webPageLd,
  aggregateRatingLd,
  faqLd,
  homepageFaq,
  localeUrl,
} from "@/lib/seo";
import { JsonLd } from "@/components/site/JsonLd";
import { HomeSections } from "@/components/site/renderers/SectionRegistry";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};
  const locale: AppLocale = rawLocale;

  const [seo, theme] = await Promise.all([
    getSeoForPage("home", locale),
    getTheme(locale),
  ]);

  return buildPageMetadata({
    title: seo.metaTitle ?? `${theme.brandName} — ${theme.tagline}`,
    description: seo.metaDescription ?? theme.tagline,
    locale,
    path: "/",
    ogImage: seo.ogImageUrl,
    noIndex: seo.noIndex,
    noFollow: seo.noFollow,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: AppLocale = rawLocale;

  const [homepage, theme] = await Promise.all([
    getHomepage(locale),
    getTheme(locale),
  ]);

  const ld: object[] = [
    organizationLd(theme),
    webPageLd({
      name: `${theme.brandName} — ${theme.tagline}`,
      description: theme.tagline,
      url: localeUrl(locale, "/"),
    }),
    faqLd(homepageFaq(locale)),
  ];
  if (homepage.whyChooseUs.reviewCount > 0) {
    ld.push(
      aggregateRatingLd({
        ratingValue: homepage.whyChooseUs.averageRating,
        reviewCount: homepage.whyChooseUs.reviewCount,
      }),
    );
  }

  return (
    <>
      <JsonLd data={ld} />
      <HomeSections homepage={homepage} />
    </>
  );
}
