import type { NextRequest } from "next/server";
import { ok, serverError } from "@/lib/api-response";
import { getHomepage } from "@/services/homepage.service";
import { isLocale, DEFAULT_LOCALE } from "@/types/locale";
import { log } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const localeParam = req.nextUrl.searchParams.get("locale") ?? DEFAULT_LOCALE;
    const locale = isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
    const data = await getHomepage(locale);
    return ok(data);
  } catch (error) {
    log.error("GET /api/homepage failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return serverError();
  }
}
