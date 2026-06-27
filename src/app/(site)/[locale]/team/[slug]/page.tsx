import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Linkedin, Mail, MapPin } from "lucide-react";
import { isLocale, type AppLocale } from "@/types/locale";
import { dictionary } from "@/lib/i18n";
import {
  getTeamMember,
  getRelatedTeamMembers,
} from "@/services/content.service";
import {
  buildPageMetadata,
  profilePageLd,
  breadcrumbLd,
  localeUrl,
} from "@/lib/seo";
import { JsonLd } from "@/components/site/JsonLd";
import { Badge } from "@/components/ui/badge";
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
  const member = await getTeamMember(slug, locale);
  if (!member) return {};
  return buildPageMetadata({
    title: `${member.name} — ${member.role}`,
    description: member.bio,
    locale,
    path: `/team/${member.slug}`,
    ogImage: member.photoUrl,
  });
}

export default async function TeamMemberPage({
  params,
}: {
  params: Params;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: AppLocale = rawLocale;
  const t = dictionary[locale];

  const member = await getTeamMember(slug, locale);
  if (!member) notFound();

  const related = await getRelatedTeamMembers(
    member.id,
    member.categorySlug,
    locale,
  );

  return (
    <>
      <JsonLd
        data={[
          profilePageLd(member, locale),
          breadcrumbLd([
            { name: t.home, url: localeUrl(locale, "/") },
            {
              name: member.name,
              url: localeUrl(locale, `/team/${member.slug}`),
            },
          ]),
        ]}
      />

      <article className="section-spacing">
        <div className="container-page flex flex-col gap-12">
          <header className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[40fr_60fr]">
            {member.photoUrl && (
              <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-md)] lg:mx-0">
                <Image
                  src={member.photoUrl}
                  alt={member.photoAlt ?? member.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex flex-col gap-4">
              <Badge variant="brand" className="self-start">
                {member.categoryTitle}
              </Badge>
              <h1 className="text-h1 font-bold text-[var(--color-text-primary)]">
                {member.name}
              </h1>
              <p className="text-h3 font-semibold text-[var(--brand-primary)]">
                {member.role}
              </p>

              <div className="flex flex-col gap-1 text-body text-[var(--color-text-secondary)]">
                {member.location && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="size-4" aria-hidden="true" />
                    {member.location}
                  </span>
                )}
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center gap-2 hover:text-[var(--brand-primary)]"
                  >
                    <Mail className="size-4" aria-hidden="true" />
                    {member.email}
                  </a>
                )}
              </div>

              {member.specialtyTags.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {member.specialtyTags.map((tag) => (
                    <li key={tag}>
                      <Badge variant="neutral">{tag}</Badge>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {member.linkedinUrl && (
                  <Button asChild variant="secondary" size="md">
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                    >
                      <Linkedin className="size-5" aria-hidden="true" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                <Button asChild variant="cta" size="md">
                  <Link
                    href={`/${locale}/contact`}
                    aria-label={dictionary[locale].contact.title}
                  >
                    {dictionary[locale].contact.title}
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          {member.fullBio && (
            <div className="max-w-3xl whitespace-pre-line text-body-lg leading-relaxed text-[var(--color-text-secondary)]">
              {member.fullBio}
            </div>
          )}

          {related.length > 0 && (
            <section
              aria-label={member.categoryTitle}
              className="flex flex-col gap-6"
            >
              <h2 className="text-h3 font-semibold text-[var(--color-text-primary)]">
                {member.categoryTitle}
              </h2>
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r) => (
                  <li key={r.id} className="h-full">
                    <Link
                      href={`/${locale}/team/${r.slug}`}
                      className="flex h-full flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
                    >
                      {r.photoUrl && (
                        <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-md)]">
                          <Image
                            src={r.photoUrl}
                            alt={r.photoAlt ?? r.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <p className="text-h4 font-semibold text-[var(--color-text-primary)]">
                        {r.name}
                      </p>
                      <p className="text-small text-[var(--color-text-muted)]">
                        {r.role}
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
