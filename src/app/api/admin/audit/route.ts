import type { NextRequest } from "next/server";
import { ok } from "@/lib/api-response";
import { assertCan } from "@/lib/permissions";
import { requireAdmin, isResponse, handleApiError } from "@/lib/api/admin-guard";
import { listAuditLogs } from "@/services/audit.service";
import type { AuditAction } from "@prisma/client";

const ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "PUBLISH",
  "ARCHIVE",
  "ROLLBACK",
  "LOGIN",
  "PERMISSION_CHANGE",
];

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "read", "audit-logs");

    const params = req.nextUrl.searchParams;
    const actionParam = params.get("action");
    const action =
      actionParam && ACTIONS.includes(actionParam) ? (actionParam as AuditAction) : undefined;

    const data = await listAuditLogs({
      userId: params.get("userId") ?? undefined,
      action,
      entityType: params.get("entityType") ?? undefined,
      entityId: params.get("entityId") ?? undefined,
      page: params.get("page") ? Number(params.get("page")) : undefined,
      pageSize: params.get("pageSize") ? Number(params.get("pageSize")) : undefined,
    });
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}
