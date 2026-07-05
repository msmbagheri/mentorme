import { notFound } from "next/navigation";
import { dictionary } from "@/lib/i18n";
import { isLocale, dirFor, type AppLocale } from "@/types/locale";
import { getTheme, getFooter } from "@/services/theme.service";
import { getMenu } from "@/services/menu.service";
import { resolveCtaByName } from "@/services/cta.service";
import { getSectionStyle } from "@/services/homepage.service";
import { sectionVars } from "@/components/site/renderers/SectionRegistry";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

const HEADER_CTA_NAME = "book-consultation";

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: AppLocale = rawLocale;
  const t = dictionary[locale];

  const [theme, footer, headerMenu, headerCta, footerStyle] = await Promise.all([
    getTheme(locale),
    getFooter(locale),
    getMenu("header", locale),
    resolveCtaByName(HEADER_CTA_NAME, locale),
    getSectionStyle("footer"),
  ]);
  const footerVars = sectionVars(footerStyle ?? undefined);

  return (
    <div dir={dirFor(locale)} className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:inset-block-start-2 focus:inset-inline-start-2 focus:z-[100] focus:rounded-[var(--radius-md)] focus:bg-[var(--color-surface)] focus:px-4 focus:py-2 focus:shadow-[var(--shadow-md)]"
      >
        {t.skipToContent}
      </a>

      <Header
        locale={locale}
        theme={theme}
        navItems={headerMenu}
        cta={headerCta}
      />

      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>

      {footerVars ? (
        <div style={footerVars} className="contents">
          <Footer locale={locale} footer={footer} theme={theme} />
        </div>
      ) : (
        <Footer locale={locale} footer={footer} theme={theme} />
      )}
    </div>
  );
}
