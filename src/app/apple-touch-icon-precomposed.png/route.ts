import { renderPwaIcon, pngResponse } from "@/lib/pwa";

// Legacy iOS fallback probe (see apple-touch-icon.png/route.ts).
export const dynamic = "force-dynamic";

export async function GET() {
  return pngResponse(await renderPwaIcon(180));
}
