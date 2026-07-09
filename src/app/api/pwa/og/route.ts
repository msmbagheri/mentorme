import { renderOgImage, pngResponse } from "@/lib/pwa";

// Open Graph banner (1200×630) generated from the CMS logo — the default
// share-preview image for the homepage (#18). Admin SEO settings with an
// explicit OG image override it.
export const dynamic = "force-dynamic";

export async function GET() {
  return pngResponse(await renderOgImage());
}
