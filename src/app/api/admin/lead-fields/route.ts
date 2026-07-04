import type { NextRequest } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ok } from "@/lib/api-response";
import { assertCan } from "@/lib/permissions";
import { requireAdmin, isResponse, handleApiError } from "@/lib/api/admin-guard";
import {
  getLeadFieldSettings,
  updateLeadFieldSetting,
} from "@/services/lead-fields.service";
import { record } from "@/services/audit.service";

const patchSchema = z.object({
  field: z.string().min(1),
  isShown: z.boolean(),
  isRequired: z.boolean(),
});

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "read", "settings");
    return ok(await getLeadFieldSettings());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "update", "settings");

    const { field, isShown, isRequired } = patchSchema.parse(await req.json().catch(() => ({})));
    // A required field must also be shown.
    const row = await updateLeadFieldSetting(field, {
      isShown: isRequired ? true : isShown,
      isRequired,
    });
    await record({
      userId: ctx.userId,
      action: "UPDATE",
      entityType: "LeadFieldSetting",
      entityId: row.id,
      details: `Lead field ${field}: shown=${row.isShown} required=${row.isRequired}.`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    // Public forms read this config server-side; bust their cache.
    revalidatePath("/en/contact");
    revalidatePath("/fa/contact");
    return ok(row);
  } catch (error) {
    return handleApiError(error);
  }
}
