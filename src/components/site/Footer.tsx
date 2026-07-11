import Link from "next/link";
import { dictionary } from "@/lib/i18n";
import { isVideoUrl } from "@/lib/media-url";
import type { AppLocale } from "@/types/locale";
import type { FooterDTO, ThemeDTO } from "@/types/cms";

interface FooterProps {
  locale: AppLocale;
  footer: FooterDTO;
  theme: ThemeDTO;
}

/**
 * Public site footer: 4 columns (brand+desc, navigation, services, contact)
 * plus a bottom bar (copyright, privacy/terms, social links). Fully CMS-driven.
 */
export function Footer({ locale, footer, theme }: FooterProps) {
  const t = dictionary[locale];
  const year = new Date().getFullYear();
  const copyright =
    footer.copyright ?? `© ${year} ${theme.brandName}. All rights reserved.`;

  const email = footer.contactEmail ?? theme.contact.email ?? null;
  const phone = footer.contactPhone ?? theme.contact.phone ?? null;
  const address = footer.address ?? theme.contact.address ?? null;
  const hours = footer.businessHours ?? theme.contact.hours ?? null;
  const socials =
    footer.socialLinks.length > 0 ? footer.socialLinks : theme.socialLinks;

  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="container-page py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Col 1 — brand + description */}
          <div className="flex flex-col gap-4">
            <Link
              href={`/${locale}`}
              aria-label={theme.brandName}
              className="inline-flex items-center gap-2"
            >
              {theme.primaryLogoUrl ? (
                isVideoUrl(theme.primaryLogoUrl) ? (
                  <video
                    src={theme.primaryLogoUrl}
                    aria-label={theme.brandName}
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="h-12 w-auto max-w-[220px] object-contain"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={theme.primaryLogoUrl}
                    alt={theme.brandName}
                    className="h-12 w-auto max-w-[220px] object-contain"
                  />
                )
              ) : (
                <span className="text-h4 font-bold text-gradient-logo">
                  {theme.brandName}
                </span>
              )}
            </Link>
            <p className="prose-justify max-w-xs text-body text-[var(--color-text-secondary)]">
              {footer.description ?? footer.tagline ?? theme.tagline}
            </p>
          </div>

          {/* Col 2 — navigation */}
          {footer.navItems.length > 0 && (
            <nav aria-label="Footer" className="flex flex-col gap-3">
              <h2 className="text-small font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                {t.menu}
              </h2>
              <ul className="flex flex-col gap-2">
                {footer.navItems.map((item) =>
                  item.external ? (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body text-[var(--color-text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
                      >
                        {item.label}
                      </a>
                    </li>
                  ) : (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className="text-body text-[var(--color-text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          )}

          {/* Col 3 — services (admin can hide the column entirely) */}
          {footer.showServices && footer.serviceLinks.length > 0 && (
            <nav aria-label={footer.servicesHeading ?? t.relatedServices} className="flex flex-col gap-3">
              <h2 className="text-small font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                {footer.servicesHeading ?? t.relatedServices}
              </h2>
              <ul className="flex flex-col gap-2">
                {footer.serviceLinks.map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      className="text-body text-[var(--color-text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Col 4 — contact */}
          <div className="flex flex-col gap-3">
            <h2 className="text-small font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t.contact.info}
            </h2>
            <address className="flex flex-col gap-2 not-italic text-body text-[var(--color-text-secondary)]">
              {address && <span>{address}</span>}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="transition-colors hover:text-[var(--brand-primary)]"
                >
                  {phone}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="transition-colors hover:text-[var(--brand-primary)]"
                >
                  {email}
                </a>
              )}
              {hours && (
                <span className="text-[var(--color-text-muted)]">
                  {t.contact.hours}: {hours}
                </span>
              )}
            </address>
          </div>
        </div>
      </div>

      {/* Trust badges (اینماد / licences) — admin-managed in Footer settings */}
      {footer.badges.length > 0 && (
        <div className="border-t border-[var(--color-border)]">
          <ul className="container-page flex flex-wrap items-center justify-center gap-6 py-6">
            {footer.badges.map((b, i) => {
              const img = (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.imageUrl}
                  alt={b.alt ?? "trust badge"}
                  loading="lazy"
                  className="h-20 w-auto max-w-[140px] object-contain"
                />
              );
              return (
                <li key={`${b.imageUrl}-${i}`} className="flex items-center">
                  {b.linkUrl ? (
                    <a
                      href={b.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="origin"
                      aria-label={b.alt ?? "trust badge"}
                    >
                      {img}
                    </a>
                  ) : (
                    img
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Bottom bar */}
      <div className="border-t border-[var(--color-border)]">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-small text-[var(--color-text-muted)]">{copyright}</p>

          {socials.length > 0 && (
            <ul className="flex flex-wrap items-center gap-4">
              {socials.map((s) => (
                <li key={s.platform}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-small font-medium capitalize text-[var(--color-text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
                  >
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
