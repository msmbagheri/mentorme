import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, created } from "@/lib/api-response";
import { assertCan } from "@/lib/permissions";
import { requireAdmin, isResponse, handleApiError } from "@/lib/api/admin-guard";
import {
  listUsers,
  createUser,
  updateUser,
  deactivateUser,
} from "@/services/user.service";
import { record } from "@/services/audit.service";
import { userCreateSchema, userUpdateSchema } from "@/lib/validation/auth.schema";

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "read", "users");
    return ok(await listUsers());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "create", "users");

    const body = await req.json().catch(() => ({}));
    const data = userCreateSchema.parse(body);
    const user = await createUser(data);
    await record({
      userId: ctx.userId,
      action: "CREATE",
      entityType: "User",
      entityId: user.id,
      details: `Created user ${data.email} (${data.role}).`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return created(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "update", "users");

    const body = await req.json().catch(() => ({}));
    const parsed = userUpdateSchema.parse(body);
    const user = await updateUser({
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      password: parsed.password || undefined,
      role: parsed.role,
      isActive: parsed.isActive,
    });
    await record({
      userId: ctx.userId,
      action: parsed.role ? "PERMISSION_CHANGE" : "UPDATE",
      entityType: "User",
      entityId: parsed.id,
      details: "Updated user.",
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return ok(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "delete", "users");

    const id = z.string().uuid().parse(req.nextUrl.searchParams.get("id"));
    const user = await deactivateUser(id);
    await record({
      userId: ctx.userId,
      action: "DELETE",
      entityType: "User",
      entityId: id,
      details: "Deactivated user.",
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return ok(user);
  } catch (error) {
    return handleApiError(error);
  }
}
