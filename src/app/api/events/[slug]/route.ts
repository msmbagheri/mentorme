import type { NextRequest } from "next/server";
import { ok, notFound, serverError } from "@/lib/api-response";
import { getEvent } from "@/services/content.service";
import { isLocale, DEFAULT_LOCALE } from "@/types/locale";
import { log } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const localeParam = req.nextUrl.searchParams.get("locale") ?? DEFAULT_LOCALE;
    const locale = isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
    const data = await getEvent(slug, locale);
    if (!data) return notFound("Event not found.");
    return ok(data);
  } catch (error) {
    log.error("GET /api/events/[slug] failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return serverError();
  }
}
