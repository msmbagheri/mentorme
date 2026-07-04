import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { assertCan } from "@/lib/permissions";
import { requireAdmin, isResponse, handleApiError } from "@/lib/api/admin-guard";
import { getThemeRaw, upsertTheme } from "@/services/theme.service";
import { record } from "@/services/audit.service";
import { themeUpdateSchema } from "@/lib/validation/theme.schema";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "read", "theme");
    return ok(await getThemeRaw());
  } catch (error) {
    return handleApiError(error);
  }
}

async function save(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if (isResponse(ctx)) return ctx.response;
  assertCan(ctx.role, "update", "theme");

  const body = await req.json().catch(() => ({}));
  const data = themeUpdateSchema.parse(body);
  const theme = await upsertTheme({
    brandName: data.brandName,
    tagline_en: data.tagline_en,
    tagline_fa: data.tagline_fa,
    primaryLogoUrl: data.primaryLogoUrl ?? null,
    darkLogoUrl: data.darkLogoUrl ?? null,
    mobileLogoUrl: data.mobileLogoUrl ?? null,
    faviconUrl: data.faviconUrl ?? null,
    primaryColor: data.primaryColor ?? null,
    accentColor: data.accentColor ?? null,
    ctaGradientStart: data.ctaGradientStart ?? null,
    ctaGradientEnd: data.ctaGradientEnd ?? null,
    fontFamilyLatin: data.fontFamilyLatin ?? null,
    fontFamilyPersian: data.fontFamilyPersian ?? null,
    fontUrlLatin: data.fontUrlLatin ?? null,
    fontUrlPersian: data.fontUrlPersian ?? null,
    buttonSize: data.buttonSize || null,
    socialLinks: (data.socialLinks ?? undefined) as Prisma.InputJsonValue | undefined,
    contactInformation: (data.contactInformation ?? undefined) as
      | Prisma.InputJsonValue
      | undefined,
  });
  await record({
    userId: ctx.userId,
    action: "UPDATE",
    entityType: "ThemeSetting",
    entityId: theme.id,
    details: "Updated theme settings.",
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });
  return ok(theme);
}

export async function POST(req: NextRequest) {
  try {
    return await save(req);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    return await save(req);
  } catch (error) {
    return handleApiError(error);
  }
}
