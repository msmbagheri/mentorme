"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { apiClient, runMutation } from "@/lib/admin-client";
import { PageHeader, Field, EmptyState, ReadOnlyNotice } from "@/components/admin/shared";

interface Cta {
  id: string;
  internalName: string;
  label_en: string;
  label_fa: string;
  actionType: string;
  internalUrl: string | null;
  externalUrl: string | null;
  calendlyUrl: string | null;
  calcomUrl: string | null;
  assetUrl: string | null;
  isActive: boolean;
}

const ACTION_TYPES = [
  "OPEN_LEAD_FORM",
  "OPEN_CONTACT_PAGE",
  "OPEN_CALENDLY",
  "OPEN_CALCOM",
  "INTERNAL_URL",
  "EXTERNAL_URL",
  "DOWNLOAD_ASSET",
];

const URL_FIELD: Record<string, keyof Cta> = {
  INTERNAL_URL: "internalUrl",
  EXTERNAL_URL: "externalUrl",
  OPEN_CALENDLY: "calendlyUrl",
  OPEN_CALCOM: "calcomUrl",
  DOWNLOAD_ASSET: "assetUrl",
};

function empty(): Cta {
  return {
    id: "",
    internalName: "",
    label_en: "",
    label_fa: "",
    actionType: "OPEN_LEAD_FORM",
    internalUrl: "",
    externalUrl: "",
    calendlyUrl: "",
    calcomUrl: "",
    assetUrl: "",
    isActive: true,
  };
}

export function CtaManager({
  ctas,
  canWrite,
  canDelete,
}: {
  ctas: Cta[];
  canWrite: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<Cta | null>(null);

  const isNew = editing && !editing.id;
  const urlKey = editing ? URL_FIELD[editing.actionType] : undefined;

  async function save() {
    if (!editing) return;
    const body = {
      internalName: editing.internalName,
      label_en: editing.label_en,
      label_fa: editing.label_fa,
      actionType: editing.actionType,
      internalUrl: editing.internalUrl || null,
      externalUrl: editing.externalUrl || null,
      calendlyUrl: editing.calendlyUrl || null,
      calcomUrl: editing.calcomUrl || null,
      assetUrl: editing.assetUrl || null,
      isActive: editing.isActive,
    };
    const res = await runMutation(
      () =>
        isNew
          ? apiClient.post("/api/admin/cta", body)
          : apiClient.patch("/api/admin/cta", { id: editing.id, ...body }),
      { success: "CTA saved", error: "Could not save CTA" },
    );
    if (res) {
      setEditing(null);
      router.refresh();
    }
  }

  async function remove(id: string) {
    const res = await runMutation(() => apiClient.delete(`/api/admin/cta?id=${id}`), {
      success: "CTA deleted",
      error: "Delete failed",
    });
    if (res) router.refresh();
  }

  return (
    <div>
      <PageHeader title="CTA Manager" description="Reusable call-to-action configurations.">
        {canWrite ? (
          <Button variant="cta" size="sm" onClick={() => setEditing(empty())}>
            <Plus className="size-4" /> New CTA
          </Button>
        ) : null}
      </PageHeader>

      {!canWrite ? <ReadOnlyNotice className="mb-4" /> : null}

      {ctas.length === 0 ? (
        <EmptyState title="No CTAs yet" />
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Internal name</TableHead>
                <TableHead>Label (EN)</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ctas.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-caption">{c.internalName}</TableCell>
                  <TableCell className="font-medium">{c.label_en}</TableCell>
                  <TableCell>
                    <Badge variant="neutral">{c.actionType.replace(/_/g, " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.isActive ? "success" : "neutral"}>
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditing(c)}>
                        <Pencil className="size-4" />
                      </Button>
                      {canDelete ? (
                        <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove(c.id)}>
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

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{isNew ? "New CTA" : "Edit CTA"}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="flex flex-col gap-4">
              <Field label="Internal name" htmlFor="cta-name" required hint="lowercase-with-hyphens">
                <Input
                  id="cta-name"
                  dir="ltr"
                  value={editing.internalName}
                  onChange={(e) => setEditing({ ...editing, internalName: e.target.value })}
                />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Label (EN)" htmlFor="cta-en" required>
                  <Input
                    id="cta-en"
                    value={editing.label_en}
                    onChange={(e) => setEditing({ ...editing, label_en: e.target.value })}
                  />
                </Field>
                <Field label="Label (FA)" htmlFor="cta-fa" required>
                  <Input
                    id="cta-fa"
                    dir="rtl"
                    value={editing.label_fa}
                    onChange={(e) => setEditing({ ...editing, label_fa: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Action type" htmlFor="cta-action">
                <Select
                  id="cta-action"
                  value={editing.actionType}
                  onChange={(e) => setEditing({ ...editing, actionType: e.target.value })}
                >
                  {ACTION_TYPES.map((a) => (
                    <option key={a} value={a}>
                      {a.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </Field>
              {urlKey ? (
                <Field label="URL" htmlFor="cta-url">
                  <Input
                    id="cta-url"
                    dir="ltr"
                    value={(editing[urlKey] as string) ?? ""}
                    onChange={(e) => setEditing({ ...editing, [urlKey]: e.target.value })}
                  />
                </Field>
              ) : null}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button variant="cta" size="sm" onClick={save}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
