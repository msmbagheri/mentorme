import type { Metadata } from "next";
import type { AppLocale } from "@/types/locale";
import { LOCALES } from "@/types/locale";
import type {
  ThemeDTO,
  ServiceDetailDTO,
  CaseStudyDetailDTO,
  EventDetailDTO,
  TeamMemberDetailDTO,
} from "@/types/cms";

/** Resolved public site origin (no trailing slash). */
export function siteUrl(): string {
  const raw = process.env.PUBLIC_SITE_URL || "http://localhost:3100";
  return raw.replace(/\/+$/, "");
}

/** Build an absolute URL for a locale + path (path should start with "/"). */
export function localeUrl(locale: AppLocale, path: string): string {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}/${locale}${clean}`;
}

const OG_LOCALE: Record<AppLocale, string> = {
  en: "en_US",
  fa: "fa_IR",
};

export interface BuildPageMetadataOptions {
  title: string;
  description?: string;
  locale: AppLocale;
  /** Path within the locale, e.g. "/services/college-admissions-strategy" or "/". */
  path: string;
  ogImage?: string | null;
  noIndex?: boolean;
  noFollow?: boolean;
}

/**
 * Build a Next.js `Metadata` object with canonical, hreflang alternates,
 * Open Graph and Twitter card data. All values are dynamic (caller-supplied).
 */
export function buildPageMetadata(opts: BuildPageMetadataOptions): Metadata {
  const { title, description, locale, path, ogImage, noIndex, noFollow } = opts;
  const canonical = localeUrl(locale, path);

  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[l] = localeUrl(l, path);
  }

  const images = ogImage
    ? [{ url: ogImage, alt: title }]
    : undefined;

  return {
    metadataBase: new URL(siteUrl()),
    title,
    description: description ?? undefined,
    alternates: {
      canonical,
      languages,
    },
    robots: {
      index: !noIndex,
      follow: !noFollow,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description: description ?? undefined,
      images,
      locale: OG_LOCALE[locale],
      siteName: "MentorMe",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description ?? undefined,
      images: images ? images.map((i) => i.url) : undefined,
    },
  };
}

// ============================================================
// JSON-LD GENERATORS — schema.org. All values dynamic from args.
// ============================================================

type Ld = Record<string, unknown>;

/** Organization schema from the public theme (brand, logo, social, contact). */
export function organizationLd(theme: ThemeDTO): Ld {
  const url = siteUrl();
  const sameAs = theme.socialLinks.map((s) => s.url).filter(Boolean);

  const contactPoint: Ld[] = [];
  if (theme.contact.phone || theme.contact.email) {
    contactPoint.push({
      "@type": "ContactPoint",
      contactType: "customer support",
      ...(theme.contact.phone ? { telephone: theme.contact.phone } : {}),
      ...(theme.contact.email ? { email: theme.contact.email } : {}),
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: theme.brandName,
    url,
    slogan: theme.tagline,
    ...(theme.primaryLogoUrl ? { logo: absolute(theme.primaryLogoUrl) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(contactPoint.length ? { contactPoint } : {}),
    ...(theme.contact.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: theme.contact.address,
          },
        }
      : {}),
  };
}

/** Generic WebPage node. */
export function webPageLd(opts: {
  name: string;
  description?: string | null;
  url: string;
}): Ld {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.name,
    ...(opts.description ? { description: opts.description } : {}),
    url: opts.url,
  };
}

/** Service schema from a service detail DTO. */
export function serviceLd(service: ServiceDetailDTO, locale: AppLocale): Ld {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.shortDescription || service.fullDescription,
    serviceType: service.title,
    url: localeUrl(locale, `/services/${service.slug}`),
    ...(service.imageUrl ? { image: absolute(service.imageUrl) } : {}),
    provider: {
      "@type": "Organization",
      name: "MentorMe",
      url: siteUrl(),
    },
    areaServed: { "@type": "Country", name: "Worldwide" },
  };
}

/** Article schema from a case study (success story) detail DTO. */
export function articleLd(cs: CaseStudyDetailDTO, locale: AppLocale): Ld {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: cs.title,
    description: cs.story,
    ...(cs.fullStory ? { articleBody: cs.fullStory } : {}),
    ...(cs.imageUrl ? { image: absolute(cs.imageUrl) } : {}),
    url: localeUrl(locale, `/case-studies/${cs.slug}`),
    inLanguage: locale,
    author: { "@type": "Organization", name: "MentorMe", url: siteUrl() },
    publisher: {
      "@type": "Organization",
      name: "MentorMe",
      url: siteUrl(),
    },
    about: cs.university ?? undefined,
  };
}

/** Event schema from an event detail DTO. */
export function eventLd(ev: EventDetailDTO, locale: AppLocale): Ld {
  const isOnline =
    !!ev.location && /online|zoom|webinar|virtual/i.test(ev.location);

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: ev.title,
    description: ev.shortDescription || ev.content,
    startDate: ev.startDate,
    ...(ev.endDate ? { endDate: ev.endDate } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    ...(ev.imageUrl ? { image: absolute(ev.imageUrl) } : {}),
    url: localeUrl(locale, `/events/${ev.slug}`),
    location: isOnline
      ? {
          "@type": "VirtualLocation",
          url:
            ev.registrationUrl ?? localeUrl(locale, `/events/${ev.slug}`),
        }
      : {
          "@type": "Place",
          name: ev.location ?? "MentorMe",
          ...(ev.location ? { address: ev.location } : {}),
        },
    organizer: {
      "@type": "Organization",
      name: "MentorMe",
      url: siteUrl(),
    },
    ...(ev.capacity ? { maximumAttendeeCapacity: ev.capacity } : {}),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: ev.registrationUrl ?? localeUrl(locale, `/events/${ev.slug}`),
    },
  };
}

/** ProfilePage schema for a team member detail DTO. */
export function profilePageLd(
  m: TeamMemberDetailDTO,
  locale: AppLocale,
): Ld {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: localeUrl(locale, `/team/${m.slug}`),
    mainEntity: {
      "@type": "Person",
      name: m.name,
      jobTitle: m.role,
      description: m.fullBio || m.bio,
      ...(m.photoUrl ? { image: absolute(m.photoUrl) } : {}),
      ...(m.email ? { email: m.email } : {}),
      ...(m.location ? { homeLocation: m.location } : {}),
      ...(m.specialtyTags.length ? { knowsAbout: m.specialtyTags } : {}),
      ...(m.linkedinUrl ? { sameAs: [m.linkedinUrl] } : {}),
      worksFor: { "@type": "Organization", name: "MentorMe", url: siteUrl() },
    },
  };
}

/** FAQPage schema from question/answer pairs. */
export function faqLd(items: { question: string; answer: string }[]): Ld {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: i.answer,
      },
    })),
  };
}

/** AggregateRating schema (typically nested or standalone for the brand). */
export function aggregateRatingLd(opts: {
  ratingValue: number;
  reviewCount: number;
}): Ld {
  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: {
      "@type": "Organization",
      name: "MentorMe",
      url: siteUrl(),
    },
    ratingValue: opts.ratingValue,
    reviewCount: opts.reviewCount,
    bestRating: 5,
    worstRating: 1,
  };
}

/** BreadcrumbList schema from ordered { name, url } items. */
export function breadcrumbLd(items: { name: string; url: string }[]): Ld {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ============================================================
// HOMEPAGE FAQ (content spec §6) — bilingual.
// ============================================================

const HOMEPAGE_FAQ: Record<
  AppLocale,
  { question: string; answer: string }[]
> = {
  en: [
    {
      question: "Is the first consultation really free?",
      answer:
        "Yes — the first consultation is completely free, with no obligation and no sales pitch. We listen to your goals and show you a clear next step.",
    },
    {
      question: "What grades do you work with?",
      answer:
        "We work with students from Grade 6 through Grade 12, as well as transfer students.",
    },
    {
      question: "Do you support international students?",
      answer:
        "Yes — we support international students, including test preparation (IELTS/TOEFL) and visa guidance.",
    },
    {
      question: "How are mentors matched?",
      answer:
        "Mentors are matched by your goals, your target schools, and your subject focus, so every student is paired with the right expert.",
    },
  ],
  fa: [
    {
      question: "آیا اولین جلسه مشاوره واقعاً رایگان است؟",
      answer:
        "بله — اولین جلسه مشاوره کاملاً رایگان است، بدون هیچ تعهد و بدون فروش فشاری. ما به اهداف شما گوش می‌دهیم و گام بعدی روشن را به شما نشان می‌دهیم.",
    },
    {
      question: "با کدام پایه‌های تحصیلی کار می‌کنید؟",
      answer:
        "ما با دانش‌آموزان پایه ششم تا دوازدهم و همچنین دانشجویان انتقالی همکاری می‌کنیم.",
    },
    {
      question: "آیا از دانشجویان بین‌المللی پشتیبانی می‌کنید؟",
      answer:
        "بله — ما از دانشجویان بین‌المللی پشتیبانی می‌کنیم، از جمله آمادگی آزمون (آیلتس/تافل) و راهنمایی ویزا.",
    },
    {
      question: "منتورها چگونه انتخاب می‌شوند؟",
      answer:
        "منتورها بر اساس اهداف شما، دانشگاه‌های هدف و حوزه تخصصی شما انتخاب می‌شوند تا هر دانش‌آموز با متخصص مناسب جفت شود.",
    },
  ],
};

/** The 4 homepage FAQ Q&As for the given locale (for `faqLd`). */
export function homepageFaq(
  locale: AppLocale,
): { question: string; answer: string }[] {
  return HOMEPAGE_FAQ[locale];
}

// ============================================================
// Helpers
// ============================================================

/** Make a possibly-relative media URL absolute against the site origin. */
function absolute(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${siteUrl()}${url.startsWith("/") ? "" : "/"}${url}`;
}
