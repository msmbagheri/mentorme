import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, created } from "@/lib/api-response";
import { assertCan } from "@/lib/permissions";
import { requireAdmin, isResponse, handleApiError } from "@/lib/api/admin-guard";
import {
  listMenus,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createMenu,
  deleteMenu,
} from "@/services/menu.service";
import { record } from "@/services/audit.service";
import {
  menuCreateSchema,
  menuItemCreateSchema,
  menuItemUpdateSchema,
} from "@/lib/validation/menu.schema";

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "read", "menus");
    return ok(await listMenus());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "create", "menus");

    const body = await req.json().catch(() => ({}));
    if (body.kind === "menu") {
      const { internalName } = menuCreateSchema.parse(body);
      const menu = await createMenu(internalName);
      await record({
        userId: ctx.userId,
        action: "CREATE",
        entityType: "Menu",
        entityId: menu.id,
        details: `Created menu ${internalName}.`,
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });
      return created(menu);
    }
    const data = menuItemCreateSchema.parse(body);
    const item = await createMenuItem(data);
    await record({
      userId: ctx.userId,
      action: "CREATE",
      entityType: "MenuItem",
      entityId: item.id,
      details: `Created menu item ${data.label_en}.`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return created(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "update", "menus");

    const body = await req.json().catch(() => ({}));
    const { id, ...data } = menuItemUpdateSchema.parse(body);
    const item = await updateMenuItem(id, data);
    await record({
      userId: ctx.userId,
      action: "UPDATE",
      entityType: "MenuItem",
      entityId: id,
      details: "Updated menu item.",
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return ok(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "delete", "menus");

    const kind = req.nextUrl.searchParams.get("kind") ?? "item";
    const id = z.string().uuid().parse(req.nextUrl.searchParams.get("id"));
    if (kind === "menu") {
      await deleteMenu(id);
      await record({
        userId: ctx.userId,
        action: "DELETE",
        entityType: "Menu",
        entityId: id,
        details: "Deleted menu.",
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });
      return ok({ id });
    }
    await deleteMenuItem(id);
    await record({
      userId: ctx.userId,
      action: "DELETE",
      entityType: "MenuItem",
      entityId: id,
      details: "Deleted menu item.",
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return ok({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
