import type { NextRequest } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
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
});

const optionalText = z.string().trim().max(500).nullish();

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
});

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "read", "homepage");
    return ok(await listHomepageSections());
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
      const { sectionType, header } = headerSchema.parse(body);
      const section = await updateSectionHeader(sectionType, header, {
        userId: ctx.userId,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });
      return ok(section);
    }

    const { sectionType, isActive } = toggleSchema.parse(body);
    const section = await setSectionActive(sectionType, isActive);
    await record({
      userId: ctx.userId,
      action: "UPDATE",
      entityType: "HomepageSection",
      entityId: section.id,
      details: `Set section ${sectionType} ${isActive ? "visible" : "hidden"}.`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    revalidatePath("/en");
    revalidatePath("/fa");
    return ok(section);
  } catch (error) {
    return handleApiError(error);
  }
}
