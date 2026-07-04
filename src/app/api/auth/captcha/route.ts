import { NextResponse } from "next/server";
import sharp from "sharp";
import { createChallenge } from "@/lib/captcha";

// Public endpoint: issues a fresh login captcha. Rasterized to PNG so the answer
// is never present in the response markup (an SVG would expose the <text>).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const { token, svg } = createChallenge();
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const image = `data:image/png;base64,${png.toString("base64")}`;
  return NextResponse.json(
    { token, image },
    { headers: { "Cache-Control": "no-store" } },
  );
}
