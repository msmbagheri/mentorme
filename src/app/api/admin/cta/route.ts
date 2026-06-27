import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, created } from "@/lib/api-response";
import { assertCan } from "@/lib/permissions";
import { requireAdmin, isResponse, handleApiError } from "@/lib/api/admin-guard";
import { listCtas, createCta, updateCta, deleteCta } from "@/services/cta.service";
import { record } from "@/services/audit.service";
import { ctaCreateSchema, ctaUpdateSchema } from "@/lib/validation/cta.schema";

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "read", "ctas");
    return ok(await listCtas());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "create", "ctas");

    const body = await req.json().catch(() => ({}));
    const data = ctaCreateSchema.parse(body);
    const cta = await createCta(data);
    await record({
      userId: ctx.userId,
      action: "CREATE",
      entityType: "CtaConfig",
      entityId: cta.id,
      details: `Created CTA ${data.internalName}.`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return created(cta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "update", "ctas");

    const body = await req.json().catch(() => ({}));
    const { id, ...data } = ctaUpdateSchema.parse(body);
    const cta = await updateCta(id, data);
    await record({
      userId: ctx.userId,
      action: "UPDATE",
      entityType: "CtaConfig",
      entityId: id,
      details: "Updated CTA.",
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return ok(cta);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "delete", "ctas");

    const id = z.string().uuid().parse(req.nextUrl.searchParams.get("id"));
    await deleteCta(id);
    await record({
      userId: ctx.userId,
      action: "DELETE",
      entityType: "CtaConfig",
      entityId: id,
      details: "Deleted CTA.",
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return ok({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
