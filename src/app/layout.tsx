import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Inter, Vazirmatn } from "next/font/google";
import { isLocale, dirFor, type AppLocale } from "@/types/locale";
import { ChunkErrorReloader } from "@/components/system/ChunkErrorReloader";
import { PwaRegister } from "@/components/system/PwaRegister";
import { ThemeStyle } from "@/components/site/ThemeStyle";
import { getPwaBranding, pwaIconHref } from "@/lib/pwa";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  // PWA identity (icons, install name) follows the CMS logo/brand at runtime;
  // getPwaBranding falls back to defaults when the DB is unreachable (build).
  const branding = await getPwaBranding();
  const icon = (size: 32 | 48 | 64 | 180 | 192) =>
    pwaIconHref(size, branding.version);
  return {
    title: {
      default: "MentorMe — Your Future, Mentored",
      template: "%s | MentorMe",
    },
    description:
      "Expert one-on-one college admissions mentorship. From uncertainty to acceptance.",
    metadataBase: new URL(process.env.PUBLIC_SITE_URL ?? "http://localhost:3100"),
    applicationName: branding.name,
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [
        { url: icon(32), sizes: "32x32", type: "image/png" },
        // Google Search favicons must be a multiple of 48px — declare one
        // explicitly so the result page shows the site logo (#17).
        { url: icon(48), sizes: "48x48", type: "image/png" },
        { url: icon(192), sizes: "192x192", type: "image/png" },
      ],
      shortcut: [{ url: icon(64), sizes: "64x64", type: "image/png" }],
      // iOS home-screen icon — without this Safari uses a dark page snapshot.
      apple: [{ url: icon(180), sizes: "180x180", type: "image/png" }],
    },
    appleWebApp: {
      capable: true,
      title: branding.name,
      statusBarStyle: "default",
    },
    // Next 15 renders `capable` as the modern mobile-web-app-capable meta;
    // ship the legacy Apple variant too so older iOS keeps standalone mode.
    other: { "apple-mobile-web-app-capable": "yes" },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const branding = await getPwaBranding();
  return { themeColor: branding.themeColor };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerLocale = (await headers()).get("x-locale") ?? "en";
  const locale: AppLocale = isLocale(headerLocale) ? headerLocale : "en";

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      className={`${inter.variable} ${vazirmatn.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeStyle />
        <ChunkErrorReloader />
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
