import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ok } from "@/lib/api-response";
import { assertCan } from "@/lib/permissions";
import { requireAdmin, isResponse, handleApiError } from "@/lib/api/admin-guard";
import { leadStatusUpdateSchema } from "@/lib/validation/lead.schema";
import {
  listLeads,
  updateLeadStatus,
  exportLeads,
} from "@/services/lead.service";
import type { LeadStatus } from "@prisma/client";

const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"];

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "read", "leads");

    const params = req.nextUrl.searchParams;
    const exportFormat = params.get("export");

    if (exportFormat === "csv" || exportFormat === "xlsx") {
      const file = await exportLeads(exportFormat);
      const isCsv = exportFormat === "csv";
      const body = isCsv ? (file as string) : (file as Buffer);
      return new NextResponse(body as BodyInit, {
        status: 200,
        headers: {
          "Content-Type": isCsv
            ? "text/csv; charset=utf-8"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="leads.${exportFormat}"`,
        },
      });
    }

    const statusParam = params.get("status");
    const status =
      statusParam && LEAD_STATUSES.includes(statusParam)
        ? (statusParam as LeadStatus)
        : undefined;

    const data = await listLeads({
      status,
      assignedToId: params.get("assignedToId") ?? undefined,
      search: params.get("search") ?? undefined,
      page: params.get("page") ? Number(params.get("page")) : undefined,
      pageSize: params.get("pageSize") ? Number(params.get("pageSize")) : undefined,
    });
    return ok(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "update", "leads");

    const body = await req.json().catch(() => ({}));
    const input = leadStatusUpdateSchema.parse(body);
    const updated = await updateLeadStatus(input, ctx.userId);
    return ok(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
