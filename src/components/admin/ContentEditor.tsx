"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { History, Loader2, RotateCcw, Save, Send, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { apiClient, runMutation } from "@/lib/admin-client";
import { formatDate } from "@/lib/utils";
import {
  Field,
  BilingualField,
  SwitchRow,
  StatusBadge,
} from "@/components/admin/shared";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { CtaSelect } from "@/components/admin/CtaSelect";
import type { ContentModuleConfig, FieldDef } from "@/components/admin/content-config";

type Values = Record<string, unknown>;

interface VersionRow {
  version: number;
  createdAt: string;
}

export function ContentEditor({
  config,
  record,
  open,
  onOpenChange,
  canWrite,
  canPublish,
  selectOptions,
}: {
  config: ContentModuleConfig;
  record: Values | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canWrite: boolean;
  canPublish: boolean;
  selectOptions: Record<string, { value: string; label: string }[]>;
}) {
  const router = useRouter();
  const isNew = !record?.id;
  const [values, setValues] = React.useState<Values>({});
  const [saving, setSaving] = React.useState(false);
  const [versions, setVersions] = React.useState<VersionRow[] | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const base: Values = { ...(record ?? {}) };
    setValues(base);
    setVersions(null);
  }, [open, record]);

  const set = (key: string, value: unknown) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const statusKey = config.eventStatus ? "eventStatus" : "status";
  const status = (values[statusKey] as string) ?? "DRAFT";

  function buildPayload(): Values {
    const out: Values = {};
    for (const f of config.fields) {
      if (f.type === "bilingual-text" || f.type === "bilingual-textarea") {
        out[`${f.name}_en`] = values[`${f.name}_en`] ?? "";
        out[`${f.name}_fa`] = values[`${f.name}_fa`] ?? "";
      } else if (f.type === "number") {
        const raw = values[f.name];
        if (raw !== undefined && raw !== "" && raw !== null) out[f.name] = Number(raw);
      } else if (f.type === "date") {
        if (values[f.name]) out[f.name] = values[f.name];
      } else if (f.type === "tags") {
        out[f.name] = Array.isArray(values[f.name]) ? values[f.name] : [];
      } else if (f.type === "cta") {
        out[f.name] = values[f.name] || null;
      } else if (f.type === "switch") {
        out[f.name] = values[f.name] !== false;
      } else {
        if (values[f.name] !== undefined) out[f.name] = values[f.name];
      }
    }
    if (config.hasFeatured) out.isFeatured = Boolean(values.isFeatured);
    if (config.hasActive) out.isActive = values.isActive !== false;
    if (isNew) out[statusKey] = status;
    return out;
  }

  async function save() {
    setSaving(true);
    const payload = buildPayload();
    const body = isNew
      ? { entityType: config.entityType, data: payload }
      : { entityType: config.entityType, action: "update", data: { id: record!.id, ...payload } };
    const res = await runMutation(
      () =>
        isNew
          ? apiClient.post("/api/admin/content", body)
          : apiClient.patch("/api/admin/content", body),
      { success: `${config.singular} saved`, error: "Could not save" },
    );
    setSaving(false);
    if (res) {
      onOpenChange(false);
      router.refresh();
    }
  }

  async function workflow(action: "publish" | "archive") {
    if (isNew) return;
    const res = await runMutation(
      () =>
        apiClient.patch("/api/admin/content", {
          entityType: config.entityType,
          action,
          id: record!.id,
        }),
      { success: action === "publish" ? "Published" : "Archived", error: "Action failed" },
    );
    if (res) {
      onOpenChange(false);
      router.refresh();
    }
  }

  async function loadVersions() {
    if (isNew) return;
    const rows = await apiClient
      .get<VersionRow[]>(
        `/api/admin/versions?entityType=${config.entityType}&entityId=${record!.id}`,
      )
      .catch(() => []);
    setVersions(rows);
  }

  async function rollback(version: number) {
    const res = await runMutation(
      () =>
        apiClient.patch("/api/admin/content", {
          entityType: config.entityType,
          action: "rollback",
          id: record!.id,
          version,
        }),
      { success: `Rolled back to v${version}`, error: "Rollback failed" },
    );
    if (res) {
      onOpenChange(false);
      router.refresh();
    }
  }

  function renderField(f: FieldDef) {
    const id = `f-${f.name}`;
    switch (f.type) {
      case "bilingual-text":
      case "bilingual-textarea":
        return (
          <BilingualField
            key={f.name}
            label={f.label}
            baseName={f.name}
            required={f.required}
            textarea={f.type === "bilingual-textarea"}
            valueEn={String(values[`${f.name}_en`] ?? "")}
            valueFa={String(values[`${f.name}_fa`] ?? "")}
            onChange={set}
          />
        );
      case "media":
        return (
          <MediaPicker
            key={f.name}
            label={f.label}
            value={String(values[f.name] ?? "")}
            onChange={(url) => set(f.name, url)}
          />
        );
      case "cta":
        return (
          <Field key={f.name} label={f.label} htmlFor={id}>
            <CtaSelect
              id={id}
              value={(values[f.name] as string) ?? null}
              onChange={(v) => set(f.name, v)}
            />
          </Field>
        );
      case "select":
        return (
          <Field key={f.name} label={f.label} htmlFor={id} required={f.required}>
            <Select
              id={id}
              value={String(values[f.name] ?? "")}
              onChange={(e) => set(f.name, e.target.value)}
            >
              <option value="">— Select —</option>
              {(selectOptions[f.name] ?? f.options ?? []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
        );
      case "switch":
        return (
          <SwitchRow
            key={f.name}
            label={f.label}
            description={f.hint}
            checked={values[f.name] !== false}
            onCheckedChange={(v) => set(f.name, v)}
            disabled={!canWrite}
          />
        );
      case "tags":
        return (
          <Field key={f.name} label={f.label} htmlFor={id} hint="Comma-separated">
            <Input
              id={id}
              value={(Array.isArray(values[f.name]) ? (values[f.name] as string[]) : []).join(", ")}
              onChange={(e) =>
                set(
                  f.name,
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
            />
          </Field>
        );
      case "date":
        return (
          <Field key={f.name} label={f.label} htmlFor={id} required={f.required}>
            <Input
              id={id}
              type="datetime-local"
              value={toDatetimeLocal(values[f.name])}
              onChange={(e) => set(f.name, e.target.value ? new Date(e.target.value).toISOString() : "")}
            />
          </Field>
        );
      default:
        return (
          <Field key={f.name} label={f.label} htmlFor={id} required={f.required} hint={f.hint}>
            <Input
              id={id}
              type={f.type === "number" ? "number" : f.type === "email" ? "email" : "text"}
              dir={f.type === "url" || f.type === "email" ? "ltr" : undefined}
              value={String(values[f.name] ?? "")}
              onChange={(e) => set(f.name, e.target.value)}
            />
          </Field>
        );
    }
  }

  const tabs = ["content", "media", "seo", "settings"] as const;
  const usedTabs = tabs.filter((t) => config.fields.some((f) => (f.tab ?? "content") === t));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {isNew ? `New ${config.singular}` : `Edit ${config.singular}`}
            {!isNew && config.hasWorkflow ? <StatusBadge status={status} /> : null}
          </DialogTitle>
          <DialogDescription>
            Fill in paired English / Persian fields. Both locales should be provided.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={usedTabs[0]}>
          <TabsList>
            {usedTabs.map((t) => (
              <TabsTrigger key={t} value={t} className="capitalize">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>
          {usedTabs.map((t) => (
            <TabsContent key={t} value={t} className="flex flex-col gap-4">
              {config.fields
                .filter((f) => (f.tab ?? "content") === t)
                .map(renderField)}
              {t === "settings" ? (
                <div className="flex flex-col gap-3">
                  {config.hasFeatured ? (
                    <SwitchRow
                      label="Featured"
                      description="Show this item in featured placements (homepage)."
                      checked={Boolean(values.isFeatured)}
                      onCheckedChange={(v) => set("isFeatured", v)}
                      disabled={!canWrite}
                    />
                  ) : null}
                  {config.hasActive ? (
                    <SwitchRow
                      label="Active"
                      description="Inactive items are hidden from the public site."
                      checked={values.isActive !== false}
                      onCheckedChange={(v) => set("isActive", v)}
                      disabled={!canWrite}
                    />
                  ) : null}
                </div>
              ) : null}
            </TabsContent>
          ))}
        </Tabs>

        {/* Versions panel */}
        {!isNew && config.hasWorkflow ? (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
            <button
              type="button"
              onClick={loadVersions}
              className="flex items-center gap-2 text-small font-semibold text-[var(--color-text-primary)]"
            >
              <History className="size-4" aria-hidden /> Version history
            </button>
            {versions ? (
              <ul className="mt-2 flex max-h-40 flex-col gap-1 overflow-y-auto">
                {versions.length === 0 ? (
                  <li className="text-caption text-[var(--color-text-muted)]">No versions yet.</li>
                ) : (
                  versions.map((v) => (
                    <li
                      key={v.version}
                      className="flex items-center justify-between text-small"
                    >
                      <span className="text-[var(--color-text-secondary)]">
                        v{v.version} · {formatDate(v.createdAt)}
                      </span>
                      {canPublish ? (
                        <button
                          type="button"
                          onClick={() => rollback(v.version)}
                          className="flex items-center gap-1 text-caption font-semibold text-[var(--brand-primary)] hover:underline"
                        >
                          <RotateCcw className="size-3.5" /> Restore
                        </button>
                      ) : null}
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-border)] pt-4">
          <div className="flex gap-2">
            {!isNew && config.hasWorkflow && canPublish ? (
              <>
                <Button type="button" variant="secondary" size="sm" onClick={() => workflow("publish")}>
                  <Send className="size-4" /> Publish
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => workflow("archive")}>
                  <Archive className="size-4" /> Archive
                </Button>
              </>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {canWrite ? (
              <Button type="button" variant="cta" size="sm" onClick={save} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function toDatetimeLocal(value: unknown): string {
  if (!value) return "";
  const d = new Date(value as string);
  if (Number.isNaN(d.getTime())) return "";
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}
