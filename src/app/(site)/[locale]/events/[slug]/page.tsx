import type { Metadata } from "next";
import { SiteMediaServer } from "@/components/site/SiteMediaServer";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { isLocale, type AppLocale } from "@/types/locale";
import { dictionary } from "@/lib/i18n";
import { formatDate, formatTime } from "@/lib/utils";
import { getEvent } from "@/services/content.service";
import { getHomepage } from "@/services/homepage.service";
import { getLeadFieldSettings } from "@/services/lead-fields.service";
import {
  buildPageMetadata,
  eventLd,
  breadcrumbLd,
  localeUrl,
} from "@/lib/seo";
import { JsonLd } from "@/components/site/JsonLd";
import { LeadForm } from "@/components/site/LeadForm";
import { Button } from "@/components/ui/button";

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
  const ev = await getEvent(slug, locale);
  if (!ev) return {};
  return buildPageMetadata({
    title: ev.metaTitle ?? ev.title,
    description: ev.metaDescription ?? ev.shortDescription,
    locale,
    path: `/events/${ev.slug}`,
    ogImage: ev.imageUrl,
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: Params;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: AppLocale = rawLocale;
  const t = dictionary[locale];

  const ev = await getEvent(slug, locale);
  if (!ev) notFound();

  const [homepage, leadFields] = await Promise.all([
    getHomepage(locale),
    getLeadFieldSettings(),
  ]);
  const grades = homepage.hero?.grades ?? [];

  const dateLabel = formatDate(ev.startDate, locale);
  const timeLabel = formatTime(ev.startDate, locale, ev.timezone ?? undefined);
  const registerHeading =
    locale === "fa" ? "ثبت‌نام در این رویداد" : "Register for this event";

  return (
    <>
      <JsonLd
        data={[
          eventLd(ev, locale),
          breadcrumbLd([
            { name: t.home, url: localeUrl(locale, "/") },
            { name: ev.title, url: localeUrl(locale, `/events/${ev.slug}`) },
          ]),
        ]}
      />

      <article className="section-spacing">
        <div className="container-page flex flex-col gap-12">
          <header className="flex flex-col gap-6">
            {ev.imageUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-md)]">
                <SiteMediaServer
                  src={ev.imageUrl}
                  alt={ev.imageAlt ?? ev.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
                <span className="absolute inset-block-start-4 inset-inline-start-4 inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--brand-primary)] px-4 py-2 text-body font-semibold text-white shadow-[var(--shadow-sm)]">
                  <Calendar className="size-5" aria-hidden="true" />
                  {dateLabel}
                </span>
              </div>
            )}

            <h1 className="text-h1 font-bold text-[var(--color-text-primary)]">
              {ev.title}
            </h1>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-body text-[var(--color-text-secondary)]">
              <span className="inline-flex items-center gap-2">
                <Clock className="size-5" aria-hidden="true" />
                {timeLabel}
                {ev.timezone ? ` (${ev.timezone})` : ""}
              </span>
              {ev.location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-5" aria-hidden="true" />
                  {ev.location}
                </span>
              )}
              {ev.capacity != null && (
                <span className="inline-flex items-center gap-2">
                  <Users className="size-5" aria-hidden="true" />
                  {ev.capacity}
                </span>
              )}
            </div>
          </header>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[60fr_40fr]">
            <div className="max-w-3xl whitespace-pre-line text-body-lg leading-relaxed text-[var(--color-text-secondary)]">
              {ev.content}
            </div>

            {/* Registration zone: external URL OR inline lead form. */}
            <aside
              id="register"
              aria-label={registerHeading}
              className="flex flex-col gap-4"
            >
              <h2 className="text-h3 font-semibold text-[var(--color-text-primary)]">
                {registerHeading}
              </h2>
              {ev.registrationUrl ? (
                <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
                  <p className="text-body text-[var(--color-text-secondary)]">
                    {ev.shortDescription}
                  </p>
                  <Button asChild variant="cta" size="lg" className="w-full">
                    <a
                      href={ev.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t.register}: ${ev.title}`}
                    >
                      {t.register}
                    </a>
                  </Button>
                </div>
              ) : (
                <LeadForm
                  locale={locale}
                  source={`event:${ev.slug}`}
                  grades={grades}
                  fields={leadFields}
                />
              )}
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
