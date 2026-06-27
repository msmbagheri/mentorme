"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { dictionary } from "@/lib/i18n";
import { CtaButton } from "@/components/site/CtaButton";
import { LocaleSwitcher } from "@/components/site/LocaleSwitcher";
import type { AppLocale } from "@/types/locale";
import type { MenuItemDTO, CtaDTO, ThemeDTO } from "@/types/cms";

interface HeaderProps {
  locale: AppLocale;
  theme: ThemeDTO;
  navItems: MenuItemDTO[];
  cta: CtaDTO | null;
}

/**
 * Sticky public header. Transparent at the top of the page, solid + shadow
 * after scroll. CMS-driven nav + single resolved primary CTA + locale switcher.
 * Mobile: logo + hamburger → fullscreen overlay menu (nav + CTA + contact + social).
 */
export function Header({ locale, theme, navItems, cta }: HeaderProps) {
  const t = dictionary[locale];
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the overlay is open.
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const homeHref = `/${locale}`;
  const logoUrl = theme.primaryLogoUrl;

  const Logo = (
    <Link
      href={homeHref}
      aria-label={theme.brandName}
      className="inline-flex items-center gap-2"
      onClick={() => setOpen(false)}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={theme.brandName}
          width={140}
          height={40}
          className="h-9 w-auto object-contain"
          priority
        />
      ) : (
        <span className="text-h4 font-bold text-gradient-logo">
          {theme.brandName}
        </span>
      )}
    </Link>
  );

  function NavLink({ item }: { item: MenuItemDTO }) {
    const cls =
      "text-body font-medium text-[var(--color-text-primary)] transition-colors hover:text-[var(--brand-primary)]";
    if (item.external) {
      return (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
          onClick={() => setOpen(false)}
        >
          {item.label}
        </a>
      );
    }
    return (
      <Link href={item.href} className={cls} onClick={() => setOpen(false)}>
        {item.label}
      </Link>
    );
  }

  return (
    <header
      className={cn(
        "sticky inset-block-start-0 top-0 z-50 w-full transition-colors duration-300",
        scrolled
          ? "border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 shadow-[var(--shadow-sm)] backdrop-blur"
          : "bg-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
        {Logo}

        {/* Desktop nav */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-7 lg:flex"
        >
          {navItems.map((item) => (
            <NavLink key={item.id} item={item} />
          ))}
        </nav>

        {/* Desktop CTA cluster */}
        <div className="hidden items-center gap-3 lg:flex">
          <LocaleSwitcher locale={locale} />
          {cta && <CtaButton cta={cta} size="md" />}
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-primary)] lg:hidden"
          aria-label={t.openMenu}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-6" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile fullscreen overlay */}
      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t.menu}
          className="fixed inset-0 z-50 flex flex-col bg-[var(--color-surface)] lg:hidden"
        >
          <div className="container-page flex h-16 items-center justify-between">
            {Logo}
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-primary)]"
              aria-label={t.close}
              onClick={() => setOpen(false)}
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>

          <div className="container-page flex flex-1 flex-col gap-8 overflow-y-auto pb-10 pt-4">
            <nav aria-label="Mobile" className="flex flex-col gap-1">
              {navItems.map((item) => (
                <div
                  key={item.id}
                  className="border-b border-[var(--color-border)] py-3 text-h4"
                >
                  <NavLink item={item} />
                </div>
              ))}
            </nav>

            <div className="flex flex-col gap-4">
              <LocaleSwitcher locale={locale} className="self-start" />
              {cta && (
                <CtaButton cta={cta} size="lg" className="w-full" />
              )}
            </div>

            {(theme.contact.email || theme.contact.phone) && (
              <div className="flex flex-col gap-1 text-body text-[var(--color-text-secondary)]">
                {theme.contact.phone && (
                  <a href={`tel:${theme.contact.phone}`}>
                    {theme.contact.phone}
                  </a>
                )}
                {theme.contact.email && (
                  <a href={`mailto:${theme.contact.email}`}>
                    {theme.contact.email}
                  </a>
                )}
              </div>
            )}

            {theme.socialLinks.length > 0 && (
              <ul className="flex flex-wrap gap-4">
                {theme.socialLinks.map((s) => (
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
          </div>
        </div>
      )}
    </header>
  );
}
