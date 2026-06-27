import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { assertCan } from "@/lib/permissions";
import { requireAdmin, isResponse, handleApiError } from "@/lib/api/admin-guard";
import {
  listSeoSettings,
  getSeoSettingByPageId,
  upsertSeoSetting,
} from "@/services/seo.service";
import { record } from "@/services/audit.service";
import { seoUpsertSchema } from "@/lib/validation/seo.schema";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "read", "seo");

    const pageId = req.nextUrl.searchParams.get("pageId");
    if (pageId) return ok(await getSeoSettingByPageId(pageId));
    return ok(await listSeoSettings());
  } catch (error) {
    return handleApiError(error);
  }
}

async function save(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if (isResponse(ctx)) return ctx.response;
  assertCan(ctx.role, "update", "seo");

  const body = await req.json().catch(() => ({}));
  const { pageId, structuredData, ...rest } = seoUpsertSchema.parse(body);
  const seo = await upsertSeoSetting(pageId, {
    ...rest,
    structuredData: (structuredData ?? undefined) as Prisma.InputJsonValue | undefined,
  });
  await record({
    userId: ctx.userId,
    action: "UPDATE",
    entityType: "SeoSetting",
    entityId: seo.id,
    details: `Updated SEO for page ${pageId}.`,
    ipAddress: ctx.ipAddress,
    userAgent: ctx.userAgent,
  });
  return ok(seo);
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
