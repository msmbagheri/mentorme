import type { NextRequest } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ok, created } from "@/lib/api-response";
import { assertCan } from "@/lib/permissions";
import { requireAdmin, isResponse, handleApiError } from "@/lib/api/admin-guard";
import {
  listGradeOptionsRaw,
  createGradeOption,
  updateGradeOption,
  deleteGradeOption,
} from "@/services/grade.service";
import { record } from "@/services/audit.service";
import { gradeCreateSchema, gradeUpdateSchema } from "@/lib/validation/grade.schema";

function revalidateSite() {
  revalidatePath("/en");
  revalidatePath("/fa");
}

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "read", "grades");
    return ok(await listGradeOptionsRaw());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "create", "grades");

    const body = await req.json().catch(() => ({}));
    const data = gradeCreateSchema.parse(body);
    const grade = await createGradeOption(data);
    await record({
      userId: ctx.userId,
      action: "CREATE",
      entityType: "GradeOption",
      entityId: grade.id,
      details: `Created grade option ${data.grade}.`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    revalidateSite();
    return created(grade);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "update", "grades");

    const body = await req.json().catch(() => ({}));
    const { id, ...data } = gradeUpdateSchema.parse(body);
    const grade = await updateGradeOption(id, data);
    await record({
      userId: ctx.userId,
      action: "UPDATE",
      entityType: "GradeOption",
      entityId: id,
      details: "Updated grade option.",
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    revalidateSite();
    return ok(grade);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "delete", "grades");

    const id = z.string().uuid().parse(req.nextUrl.searchParams.get("id"));
    await deleteGradeOption(id);
    await record({
      userId: ctx.userId,
      action: "DELETE",
      entityType: "GradeOption",
      entityId: id,
      details: "Deleted grade option.",
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    revalidateSite();
    return ok({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
