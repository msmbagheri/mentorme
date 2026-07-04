import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok } from "@/lib/api-response";
import { assertCan } from "@/lib/permissions";
import { requireAdmin, isResponse, handleApiError } from "@/lib/api/admin-guard";
import {
  listHomepageSections,
  setSectionActive,
  updateSectionHeader,
} from "@/services/homepage.service";
import { record } from "@/services/audit.service";

const toggleSchema = z.object({
  sectionType: z.string().min(1),
  isActive: z.boolean(),
  pageSlug: z.string().min(1).optional(),
});

const optionalText = z.string().trim().max(500).nullish();

// #RGB / #RRGGBB / #RRGGBBAA, or empty string to clear.
const optionalHex = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{3,8}$/)
  .or(z.literal(""))
  .optional();

const headerSchema = z.object({
  sectionType: z.string().min(1),
  header: z.object({
    eyebrow_en: optionalText,
    eyebrow_fa: optionalText,
    title_en: optionalText,
    title_fa: optionalText,
    description_en: optionalText,
    description_fa: optionalText,
  }),
  // Optional section-level layout knob (cards per row).
  cardsPerRow: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  // Optional per-section color overrides.
  bgColor: optionalHex,
  textColor: optionalHex,
  accentColor: optionalHex,
  pageSlug: z.string().min(1).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "read", "homepage");
    const pageSlug = req.nextUrl.searchParams.get("pageSlug") ?? undefined;
    return ok(await listHomepageSections(pageSlug));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "update", "homepage");

    const body = await req.json().catch(() => ({}));

    // Header copy update (eyebrow/title/description, both locales).
    if (body && typeof body === "object" && "header" in body) {
      const { sectionType, header, cardsPerRow, bgColor, textColor, accentColor, pageSlug } =
        headerSchema.parse(body);
      const section = await updateSectionHeader(
        sectionType,
        { ...header, cardsPerRow, bgColor, textColor, accentColor },
        {
          userId: ctx.userId,
          ipAddress: ctx.ipAddress,
          userAgent: ctx.userAgent,
        },
        pageSlug,
      );
      return ok(section);
    }

    const { sectionType, isActive, pageSlug } = toggleSchema.parse(body);
    const section = await setSectionActive(sectionType, isActive, pageSlug);
    await record({
      userId: ctx.userId,
      action: "UPDATE",
      entityType: "HomepageSection",
      entityId: section.id,
      details: `Set section ${sectionType} ${isActive ? "visible" : "hidden"} on ${pageSlug ?? "home"}.`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return ok(section);
  } catch (error) {
    return handleApiError(error);
  }
}
