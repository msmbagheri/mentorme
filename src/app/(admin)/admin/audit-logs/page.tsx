import { requireCan } from "@/lib/admin-session";
import { listAuditLogs } from "@/services/audit.service";
import { AuditLogTable } from "@/components/admin/AuditLogTable";
import { serializeRows } from "@/lib/serialize";
import type { AuditAction } from "@prisma/client";

export const dynamic = "force-dynamic";

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

export default async function AuditLogsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entityType?: string }>;
}) {
  await requireCan("audit-logs", "read");
  const sp = await searchParams;
  const action =
    sp.action && ACTIONS.includes(sp.action) ? (sp.action as AuditAction) : undefined;

  const { items, total } = await listAuditLogs({
    action,
    entityType: sp.entityType,
    pageSize: 100,
  });

  return (
    <AuditLogTable
      logs={serializeRows(items) as never}
      total={total}
      filterAction={sp.action ?? ""}
      filterEntity={sp.entityType ?? ""}
    />
  );
}
