import type { NextRequest } from "next/server";
import {
  PWA_ICON_SIZES,
  type PwaIconSize,
  renderPwaIcon,
  pngResponse,
} from "@/lib/pwa";

/**
 * Home-screen / favicon PNGs generated from the CMS logo.
 * `?size=` must be one of PWA_ICON_SIZES; `?maskable=1` pads for Android's
 * adaptive-icon mask. Referenced by the manifest and the root layout <link>s.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const size = Number(params.get("size") ?? "192");
  if (!(PWA_ICON_SIZES as readonly number[]).includes(size)) {
    // Body-less 400: the production CDN edge truncates chunked error bodies,
    // which strict clients (Playwright fetch) report as an aborted request.
    return new Response(null, { status: 400 });
  }
  const png = await renderPwaIcon(size as PwaIconSize, params.get("maskable") === "1");
  return pngResponse(png);
}
