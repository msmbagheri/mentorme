"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatDate, formatTime } from "@/lib/utils";
import { PageHeader, EmptyState } from "@/components/admin/shared";

interface AuditRow {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: string;
  createdAt: string;
  user?: { id: string; name: string | null; email: string } | null;
}

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

const ACTION_VARIANT: Record<string, BadgeProps["variant"]> = {
  CREATE: "success",
  UPDATE: "info",
  DELETE: "error",
  PUBLISH: "brand",
  ARCHIVE: "warning",
  ROLLBACK: "warning",
  LOGIN: "neutral",
  PERMISSION_CHANGE: "warning",
};

export function AuditLogTable({
  logs,
  total,
  filterAction,
  filterEntity,
}: {
  logs: AuditRow[];
  total: number;
  filterAction: string;
  filterEntity: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [entity, setEntity] = React.useState(filterEntity);

  function applyParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/admin/audit-logs?${next.toString()}`);
  }

  return (
    <div>
      <PageHeader title="Audit Logs" description={`${total} recorded actions.`} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Select
          value={filterAction}
          onChange={(e) => applyParam("action", e.target.value)}
          aria-label="Filter by action"
        >
          <option value="">All actions</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
        <div className="relative">
          <Search className="pointer-events-none absolute inset-inline-start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)] start-3" />
          <Input
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyParam("entityType", entity)}
            placeholder="Filter by entity type (e.g. Service)…"
            className="ps-9"
            aria-label="Filter by entity"
          />
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState title="No audit entries match your filters" />
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-caption text-[var(--color-text-muted)]">
                    {formatDate(log.createdAt)} · {formatTime(log.createdAt)}
                  </TableCell>
                  <TableCell>{log.user?.name ?? log.user?.email ?? "System"}</TableCell>
                  <TableCell>
                    <Badge variant={ACTION_VARIANT[log.action] ?? "neutral"}>
                      {log.action.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-caption">
                    {log.entityType ?? "—"}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-[var(--color-text-secondary)]">
                    {log.details}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
