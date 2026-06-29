import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter, Vazirmatn } from "next/font/google";
import { isLocale, dirFor, type AppLocale } from "@/types/locale";
import { ChunkErrorReloader } from "@/components/system/ChunkErrorReloader";
import { ThemeStyle } from "@/components/site/ThemeStyle";
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

export const metadata: Metadata = {
  title: {
    default: "MentorMe — Your Future, Mentored",
    template: "%s | MentorMe",
  },
  description:
    "Expert one-on-one college admissions mentorship. From uncertainty to acceptance.",
  metadataBase: new URL(process.env.PUBLIC_SITE_URL ?? "http://localhost:3100"),
};

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
        {children}
      </body>
    </html>
  );
}
