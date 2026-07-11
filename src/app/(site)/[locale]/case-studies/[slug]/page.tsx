import type { Metadata } from "next";
import { SiteMediaServer } from "@/components/site/SiteMediaServer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type AppLocale } from "@/types/locale";
import { dictionary } from "@/lib/i18n";
import {
  getCaseStudy,
  getRelatedCaseStudies,
} from "@/services/content.service";
import {
  buildPageMetadata,
  articleLd,
  breadcrumbLd,
  localeUrl,
} from "@/lib/seo";
import { JsonLd } from "@/components/site/JsonLd";
import { CtaButton } from "@/components/site/CtaButton";
import { Badge } from "@/components/ui/badge";

export const revalidate = 60;

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) return {};
  const locale: AppLocale = rawLocale;
  const cs = await getCaseStudy(slug, locale);
  if (!cs) return {};
  return buildPageMetadata({
    title: cs.metaTitle ?? cs.title,
    description: cs.metaDescription ?? cs.story,
    locale,
    path: `/case-studies/${cs.slug}`,
    ogImage: cs.imageUrl,
  });
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Params;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: AppLocale = rawLocale;
  const t = dictionary[locale];

  const cs = await getCaseStudy(slug, locale);
  if (!cs) notFound();

  const related = await getRelatedCaseStudies(cs.id, locale);

  return (
    <>
      <JsonLd
        data={[
          articleLd(cs, locale),
          breadcrumbLd([
            { name: t.home, url: localeUrl(locale, "/") },
            {
              name: cs.title,
              url: localeUrl(locale, `/case-studies/${cs.slug}`),
            },
          ]),
        ]}
      />

      <article className="section-spacing">
        <div className="container-page flex flex-col gap-12">
          <header className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            {cs.imageUrl && (
              <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-md)]">
                <SiteMediaServer
                  src={cs.imageUrl}
                  alt={cs.imageAlt ?? cs.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-col gap-4">
              {cs.outcomeBadge && (
                <Badge variant="success" className="self-start">
                  {cs.outcomeBadge}
                </Badge>
              )}
              <h1 className="text-h1 font-bold text-[var(--color-text-primary)]">
                {cs.name}
              </h1>
              <p className="text-h3 font-semibold text-[var(--brand-primary)]">
                {cs.title}
              </p>
              {cs.university && (
                <p className="text-body text-[var(--color-text-secondary)]">
                  {cs.university}
                </p>
              )}
            </div>
          </header>

          <div className="prose-justify max-w-3xl whitespace-pre-line text-body-lg leading-relaxed text-[var(--color-text-secondary)]">
            {cs.fullStory ?? cs.story}
          </div>

          {cs.cta && (
            <div className="rounded-[var(--radius-xl)] bg-gradient-soft p-8 text-center md:p-12">
              <CtaButton cta={cs.cta} variant="cta" size="lg" />
            </div>
          )}

          {related.length > 0 && (
            <section aria-label={t.relatedStories} className="flex flex-col gap-6">
              <h2 className="text-h3 font-semibold text-[var(--color-text-primary)]">
                {t.relatedStories}
              </h2>
              <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {related.map((r) => (
                  <li key={r.id} className="h-full">
                    <Link
                      href={`/${locale}/case-studies/${r.slug}`}
                      className="flex h-full flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
                    >
                      <p className="text-h4 font-semibold text-[var(--color-text-primary)]">
                        {r.name}
                      </p>
                      {r.outcomeBadge && (
                        <Badge variant="success" className="self-start">
                          {r.outcomeBadge}
                        </Badge>
                      )}
                      <p className="flex-1 text-body text-[var(--color-text-secondary)]">
                        {r.story}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>
    </>
  );
}
