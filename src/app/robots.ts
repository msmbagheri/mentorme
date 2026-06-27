import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

/**
 * Robots policy: index public pages, keep the admin panel and admin APIs out
 * of search engines. Sitemap points at the dynamic /sitemap.xml route.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = siteUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/admin"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
