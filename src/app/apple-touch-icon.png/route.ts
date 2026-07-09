import { renderPwaIcon, pngResponse } from "@/lib/pwa";

// iOS probes this well-known path when a page declares no icon <link>s (e.g.
// error shells). Serve the same generated 180px icon so every "Add to Home
// Screen" gets real artwork. Dynamic: reads the theme row + logo at runtime.
export const dynamic = "force-dynamic";

export async function GET() {
  return pngResponse(await renderPwaIcon(180));
}
