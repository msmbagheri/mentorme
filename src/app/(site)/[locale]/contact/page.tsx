import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { isLocale, type AppLocale } from "@/types/locale";
import { dictionary } from "@/lib/i18n";
import { getTheme } from "@/services/theme.service";
import { getHomepage } from "@/services/homepage.service";
import { getLeadFieldSettings } from "@/services/lead-fields.service";
import { getSeoForPage } from "@/services/seo.service";
import {
  buildPageMetadata,
  organizationLd,
  webPageLd,
  localeUrl,
} from "@/lib/seo";
import { JsonLd } from "@/components/site/JsonLd";
import { LeadForm } from "@/components/site/LeadForm";

export const revalidate = 60;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};
  const locale: AppLocale = rawLocale;
  const t = dictionary[locale];

  const seo = await getSeoForPage("contact", locale);
  return buildPageMetadata({
    title: seo.metaTitle ?? t.contact.title,
    description: seo.metaDescription ?? undefined,
    locale,
    path: "/contact",
    ogImage: seo.ogImageUrl,
    noIndex: seo.noIndex,
    noFollow: seo.noFollow,
  });
}

export default async function ContactPage({ params }: { params: Params }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: AppLocale = rawLocale;
  const t = dictionary[locale];

  const [theme, homepage, leadFields] = await Promise.all([
    getTheme(locale),
    getHomepage(locale),
    getLeadFieldSettings(),
  ]);
  const grades = homepage.hero?.grades ?? [];
  const { contact, socialLinks } = theme;

  return (
    <>
      <JsonLd
        data={[
          organizationLd(theme),
          webPageLd({
            name: t.contact.title,
            url: localeUrl(locale, "/contact"),
          }),
        ]}
      />

      <section className="section-spacing">
        <div className="container-page flex flex-col gap-12">
          <header className="flex flex-col gap-3">
            <h1 className="text-h1 font-bold text-[var(--color-text-primary)]">
              {t.contact.title}
            </h1>
            <p className="max-w-2xl text-body-lg text-[var(--color-text-secondary)]">
              {theme.tagline}
            </p>
          </header>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[60fr_40fr]">
            <LeadForm locale={locale} source="contact_form" grades={grades} fields={leadFields} />

            <aside className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h2 className="text-h3 font-semibold text-[var(--color-text-primary)]">
                  {t.contact.info}
                </h2>
                <ul className="flex flex-col gap-3 text-body text-[var(--color-text-secondary)]">
                  {contact.address && (
                    <li className="inline-flex items-start gap-3">
                      <MapPin className="mt-1 size-5 shrink-0 text-[var(--brand-primary)]" aria-hidden="true" />
                      <span>{contact.address}</span>
                    </li>
                  )}
                  {contact.phone && (
                    <li className="inline-flex items-center gap-3">
                      <Phone className="size-5 shrink-0 text-[var(--brand-primary)]" aria-hidden="true" />
                      <a href={`tel:${contact.phone}`} className="hover:text-[var(--brand-primary)]">
                        {contact.phone}
                      </a>
                    </li>
                  )}
                  {contact.email && (
                    <li className="inline-flex items-center gap-3">
                      <Mail className="size-5 shrink-0 text-[var(--brand-primary)]" aria-hidden="true" />
                      <a href={`mailto:${contact.email}`} className="hover:text-[var(--brand-primary)]">
                        {contact.email}
                      </a>
                    </li>
                  )}
                  {contact.hours && (
                    <li className="inline-flex items-center gap-3">
                      <Clock className="size-5 shrink-0 text-[var(--brand-primary)]" aria-hidden="true" />
                      <span>
                        {t.contact.hours}: {contact.hours}
                      </span>
                    </li>
                  )}
                </ul>
              </div>

              {socialLinks.length > 0 && (
                <ul className="flex flex-wrap gap-4">
                  {socialLinks.map((s) => (
                    <li key={s.platform}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-small font-medium capitalize text-[var(--color-text-secondary)] hover:text-[var(--brand-primary)]"
                      >
                        {s.platform}
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {/* Map placeholder area (office location) */}
              <div
                role="img"
                aria-label={contact.address ?? t.contact.info}
                className="flex aspect-video w-full items-center justify-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]"
              >
                <MapPin className="size-8" aria-hidden="true" />
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
