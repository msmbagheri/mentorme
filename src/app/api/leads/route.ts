import type { NextRequest } from "next/server";
import {
  created,
  fromZodError,
  tooManyRequests,
  serverError,
} from "@/lib/api-response";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp, getUserAgent } from "@/lib/security";
import { leadCreateSchema } from "@/lib/validation/lead.schema";
import { createLead } from "@/services/lead.service";
import { getLeadFieldSettings } from "@/services/lead-fields.service";
import { log } from "@/lib/logger";
import { z, ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limit = rateLimit(
      `lead:${ip}`,
      RATE_LIMITS.LEAD.limit,
      RATE_LIMITS.LEAD.windowMs,
    );
    if (!limit.success) {
      log.lead("Lead submission rate-limited", { ip });
      return tooManyRequests("Too many submissions. Please try again later.");
    }

    const body = await req.json().catch(() => ({}));
    const parsed = leadCreateSchema.parse(body);

    // Enforce admin-configured required optional fields (phone/country/notes).
    const fieldSettings = await getLeadFieldSettings();
    const missing = fieldSettings
      .filter(
        (f) =>
          f.isRequired &&
          !String((parsed as Record<string, unknown>)[f.field] ?? "").trim(),
      )
      .map((f) => f.field);
    if (missing.length > 0) {
      return fromZodError(
        new ZodError(
          missing.map((field) => ({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${field} is required.`,
          })),
        ),
      );
    }

    const { id } = await createLead(
      {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email,
        phone: parsed.phone || null,
        grade: parsed.grade ?? null,
        country: parsed.country || null,
        source: parsed.source || "homepage_cta",
        notes: parsed.notes || null,
        campaignData: parsed.campaignData ?? null,
      },
      { ipAddress: ip, userAgent: getUserAgent(req) },
    );

    return created({ id });
  } catch (error) {
    if (error instanceof ZodError) return fromZodError(error);
    log.error("POST /api/leads failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return serverError();
  }
}
