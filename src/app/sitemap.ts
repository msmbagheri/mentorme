import type { MetadataRoute } from "next";
import { LOCALES } from "@/types/locale";
import {
  listServices,
  listCaseStudies,
  listTeam,
  listAllPublishedEvents,
} from "@/services/content.service";
import { localeUrl } from "@/lib/seo";

// Rendered on-demand (reads the DB via the service layer). Marking it dynamic keeps
// `next build` from trying to prerender it at build time, so the image builds without
// a live database. The sitemap is regenerated per request at runtime.
export const dynamic = "force-dynamic";

/**
 * Dynamic sitemap: homepage, contact, and every active/published Service,
 * CaseStudy, TeamMember and Event — for BOTH /en and /fa. Data comes from the
 * service layer (never Prisma directly). Each URL also advertises its hreflang
 * alternates so search engines see the bilingual pairing.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Slugs are locale-agnostic; fetch once (EN) to enumerate paths.
  const [services, caseStudies, teamCategories, events] = await Promise.all([
    listServices("en"),
    listCaseStudies("en"),
    listTeam("en"),
    listAllPublishedEvents("en"),
  ]);

  const teamMembers = teamCategories.flatMap((cat) => cat.members);

  // Build the set of locale-agnostic paths to emit for every locale.
  const paths: string[] = [
    "/",
    "/contact",
    ...services.map((s) => `/services/${s.slug}`),
    ...caseStudies.map((c) => `/case-studies/${c.slug}`),
    ...teamMembers.map((m) => `/team/${m.slug}`),
    ...events.map((e) => `/events/${e.slug}`),
  ];

  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of paths) {
    const languages: Record<string, string> = {};
    for (const locale of LOCALES) {
      languages[locale] = localeUrl(locale, path);
    }
    for (const locale of LOCALES) {
      entries.push({
        url: localeUrl(locale, path),
        lastModified: now,
        changeFrequency: path === "/" ? "daily" : "weekly",
        priority: path === "/" ? 1 : 0.7,
        alternates: { languages },
      });
    }
  }

  return entries;
}
