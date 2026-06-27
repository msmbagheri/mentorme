import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { isLocale, type AppLocale } from "@/types/locale";
import { dictionary } from "@/lib/i18n";
import { getService, getRelatedServices } from "@/services/content.service";
import {
  buildPageMetadata,
  serviceLd,
  breadcrumbLd,
  localeUrl,
} from "@/lib/seo";
import { JsonLd } from "@/components/site/JsonLd";
import { CtaButton } from "@/components/site/CtaButton";

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
  const service = await getService(slug, locale);
  if (!service) return {};
  return buildPageMetadata({
    title: service.metaTitle ?? service.title,
    description: service.metaDescription ?? service.shortDescription,
    locale,
    path: `/services/${service.slug}`,
    ogImage: service.imageUrl,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Params;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: AppLocale = rawLocale;
  const t = dictionary[locale];

  const service = await getService(slug, locale);
  if (!service) notFound();

  const related = await getRelatedServices(service.id, locale);

  return (
    <>
      <JsonLd
        data={[
          serviceLd(service, locale),
          breadcrumbLd([
            { name: t.home, url: localeUrl(locale, "/") },
            {
              name: service.title,
              url: localeUrl(locale, `/services/${service.slug}`),
            },
          ]),
        ]}
      />

      <article className="section-spacing">
        <div className="container-page flex flex-col gap-12">
          <header className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              <h1 className="text-h1 font-bold text-[var(--color-text-primary)]">
                {service.title}
              </h1>
              <p className="text-body-lg text-[var(--color-text-secondary)]">
                {service.shortDescription}
              </p>
              {service.cta && (
                <div className="pt-2">
                  <CtaButton cta={service.cta} variant="cta" size="lg" />
                </div>
              )}
            </div>
            {service.imageUrl && (
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-md)]">
                <Image
                  src={service.imageUrl}
                  alt={service.imageAlt ?? service.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
          </header>

          <div className="prose-content max-w-3xl whitespace-pre-line text-body-lg leading-relaxed text-[var(--color-text-secondary)]">
            {service.fullDescription}
          </div>

          {service.cta && (
            <div className="rounded-[var(--radius-xl)] bg-gradient-soft p-8 text-center md:p-12">
              <CtaButton cta={service.cta} variant="cta" size="lg" />
            </div>
          )}

          {related.length > 0 && (
            <section aria-label={t.relatedServices} className="flex flex-col gap-6">
              <h2 className="text-h3 font-semibold text-[var(--color-text-primary)]">
                {t.relatedServices}
              </h2>
              <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {related.map((r) => (
                  <li key={r.id} className="h-full">
                    <Link
                      href={`/${locale}/services/${r.slug}`}
                      className="group flex h-full flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
                    >
                      <h3 className="text-h4 font-semibold text-[var(--color-text-primary)]">
                        {r.title}
                      </h3>
                      <p className="flex-1 text-body text-[var(--color-text-secondary)]">
                        {r.shortDescription}
                      </p>
                      <span className="inline-flex items-center gap-1 text-body font-semibold text-[var(--brand-primary)]">
                        {t.viewDetails}
                        <ArrowRight
                          className="size-4 rtl:rotate-180"
                          aria-hidden="true"
                        />
                      </span>
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
