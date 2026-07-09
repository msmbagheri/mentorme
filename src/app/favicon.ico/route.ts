import { renderPwaIcon, pngResponse } from "@/lib/pwa";

// Browsers request /favicon.ico unprompted (and bookmarks use it). Serving
// PNG bytes here is fine for every current browser; the <link rel="icon">
// tags in the root layout are the primary source.
export const dynamic = "force-dynamic";

export async function GET() {
  return pngResponse(await renderPwaIcon(48));
}
