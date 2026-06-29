"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiClient, runMutation } from "@/lib/admin-client";
import { formatDate } from "@/lib/utils";
import { PageHeader, StatusBadge, EmptyState, ReadOnlyNotice } from "@/components/admin/shared";
import { ContentEditor } from "@/components/admin/ContentEditor";
import type { ContentModuleConfig } from "@/components/admin/content-config";

type Row = Record<string, unknown> & { id: string };

export function ContentList({
  config,
  rows,
  canWrite,
  canPublish,
  canDelete,
  selectOptions = {},
  createDefaults,
}: {
  config: ContentModuleConfig;
  rows: Row[];
  canWrite: boolean;
  canPublish: boolean;
  canDelete: boolean;
  selectOptions?: Record<string, { value: string; label: string }[]>;
  createDefaults?: Record<string, unknown>;
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<Row | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<Row | null>(null);

  const statusKey = config.eventStatus ? "eventStatus" : "status";

  const filtered = React.useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      JSON.stringify(r).toLowerCase().includes(q),
    );
  }, [rows, search]);

  async function toggle(row: Row, key: "isActive" | "isFeatured", value: boolean) {
    await runMutation(
      () =>
        apiClient.patch("/api/admin/content", {
          entityType: config.entityType,
          action: "update",
          data: { id: row.id, [key]: value },
        }),
      { success: "Updated", error: "Could not update" },
    );
    router.refresh();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const res = await runMutation(
      () =>
        apiClient.delete(
          `/api/admin/content?entityType=${config.entityType}&id=${deleteTarget.id}`,
        ),
      { success: `${config.singular} deleted`, error: "Delete failed" },
    );
    setDeleteTarget(null);
    if (res) router.refresh();
  }

  function cellValue(row: Row, col: { key: string; bilingualBase?: string }) {
    if (col.bilingualBase) return String(row[`${col.bilingualBase}_en`] ?? "");
    if (col.key === "startDate" && row.startDate)
      return formatDate(row.startDate as string);
    return String(row[col.key] ?? "—");
  }

  return (
    <div>
      <PageHeader title={config.plural} description={`Manage ${config.plural.toLowerCase()}.`}>
        <div className="relative">
          <Search className="pointer-events-none absolute inset-inline-start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)] start-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="h-11 w-56 ps-9"
            aria-label="Search"
          />
        </div>
        {canWrite ? (
          <Button variant="cta" size="sm" onClick={() => setEditing(null)}>
            <Plus className="size-4" /> New {config.singular}
          </Button>
        ) : null}
      </PageHeader>

      {!canWrite ? <ReadOnlyNotice className="mb-4" /> : null}

      {filtered.length === 0 ? (
        <EmptyState
          title={`No ${config.plural.toLowerCase()} yet`}
          description={canWrite ? `Create your first ${config.singular.toLowerCase()}.` : undefined}
        >
          {canWrite ? (
            <Button variant="cta" size="sm" onClick={() => setEditing(null)}>
              <Plus className="size-4" /> New {config.singular}
            </Button>
          ) : null}
        </EmptyState>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <Table>
            <TableHeader>
              <TableRow>
                {config.listColumns.map((c) => (
                  <TableHead key={c.key}>{c.label}</TableHead>
                ))}
                {config.hasWorkflow ? <TableHead>Status</TableHead> : null}
                {config.hasFeatured ? <TableHead>Featured</TableHead> : null}
                {config.hasActive ? <TableHead>Active</TableHead> : null}
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  {config.listColumns.map((c) => (
                    <TableCell key={c.key} className="font-medium">
                      {cellValue(row, c)}
                    </TableCell>
                  ))}
                  {config.hasWorkflow ? (
                    <TableCell>
                      <StatusBadge status={String(row[statusKey] ?? "DRAFT")} />
                    </TableCell>
                  ) : null}
                  {config.hasFeatured ? (
                    <TableCell>
                      <Switch
                        checked={Boolean(row.isFeatured)}
                        disabled={!canWrite}
                        onCheckedChange={(v) => toggle(row, "isFeatured", v)}
                        aria-label="Toggle featured"
                      />
                    </TableCell>
                  ) : null}
                  {config.hasActive ? (
                    <TableCell>
                      <Switch
                        checked={row.isActive !== false}
                        disabled={!canWrite}
                        onCheckedChange={(v) => toggle(row, "isActive", v)}
                        aria-label="Toggle active"
                      />
                    </TableCell>
                  ) : null}
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditing(row)}
                        aria-label={`Edit ${config.singular}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      {canDelete ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(row)}
                          aria-label={`Delete ${config.singular}`}
                        >
                          <Trash2 className="size-4 text-[var(--color-error)]" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editing !== undefined ? (
        <ContentEditor
          config={config}
          record={editing}
          open
          onOpenChange={(o) => {
            if (!o) setEditing(undefined);
          }}
          canWrite={canWrite}
          canPublish={canPublish}
          selectOptions={selectOptions}
          createDefaults={createDefaults}
        />
      ) : null}

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete {config.singular}?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The record will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
