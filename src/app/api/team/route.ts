import type { NextRequest } from "next/server";
import { ok, serverError } from "@/lib/api-response";
import { listTeam } from "@/services/content.service";
import { isLocale, DEFAULT_LOCALE } from "@/types/locale";
import { log } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const localeParam = req.nextUrl.searchParams.get("locale") ?? DEFAULT_LOCALE;
    const locale = isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
    return ok(await listTeam(locale));
  } catch (error) {
    log.error("GET /api/team failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return serverError();
  }
}
