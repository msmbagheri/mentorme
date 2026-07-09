import type { MetadataRoute } from "next";
import { getPwaBranding, pwaIconHref } from "@/lib/pwa";

// Rendered on-demand: brand name, colors and icon URLs come from the CMS theme
// row, so admin changes apply without a rebuild (and `next build` needs no DB).
export const dynamic = "force-dynamic";

/**
 * Web app manifest — makes "Add to Home Screen" install a real, standalone
 * PWA with the site logo as its icon on both Android and iOS.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const branding = await getPwaBranding();
  const icon = (size: 180 | 192 | 512, maskable = false) => ({
    src: pwaIconHref(size, branding.version, maskable),
    sizes: `${size}x${size}`,
    type: "image/png",
    purpose: maskable ? ("maskable" as const) : ("any" as const),
  });

  return {
    id: "/",
    name: branding.name,
    short_name: branding.name,
    description: branding.description,
    // "/" redirects to the visitor's locale (/en, /fa) — supported for PWAs.
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: branding.themeColor,
    icons: [
      icon(192),
      icon(512),
      icon(192, true),
      icon(512, true),
      icon(180),
    ],
  };
}
