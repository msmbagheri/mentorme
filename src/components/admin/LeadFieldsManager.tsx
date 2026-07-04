"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, runMutation } from "@/lib/admin-client";
import { ReadOnlyNotice } from "@/components/admin/shared";

interface LeadFieldSetting {
  field: string;
  isShown: boolean;
  isRequired: boolean;
}

const LABELS: Record<string, string> = {
  phone: "Phone",
  country: "Country",
  notes: "Message / notes",
};

export function LeadFieldsManager({
  fields,
  canWrite,
}: {
  fields: LeadFieldSetting[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [rows, setRows] = React.useState(fields);
  const [pending, setPending] = React.useState<string | null>(null);

  async function update(field: string, next: { isShown: boolean; isRequired: boolean }) {
    setPending(field);
    // A required field is implicitly shown.
    const payload = next.isRequired ? { ...next, isShown: true } : next;
    setRows((rs) => rs.map((r) => (r.field === field ? { ...r, ...payload } : r)));
    const res = await runMutation(
      () => apiClient.patch("/api/admin/lead-fields", { field, ...payload }),
      { success: "Form field updated", error: "Could not update field" },
    );
    setPending(null);
    if (res) router.refresh();
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-h4">Contact form fields</CardTitle>
        <p className="text-small text-[var(--color-text-muted)]">
          Choose which optional fields appear on the public contact form and which are required.
          Name and email are always shown and required.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!canWrite ? <ReadOnlyNotice /> : null}
        {rows.map((r) => (
          <div
            key={r.field}
            className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-medium text-[var(--color-text-primary)]">
              {LABELS[r.field] ?? r.field}
            </span>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-small text-[var(--color-text-secondary)]">
                Shown
                <Switch
                  checked={r.isShown}
                  disabled={!canWrite || r.isRequired || pending === r.field}
                  onCheckedChange={(v) => update(r.field, { isShown: v, isRequired: r.isRequired })}
                  aria-label={`${LABELS[r.field]} shown`}
                />
              </label>
              <label className="flex items-center gap-2 text-small text-[var(--color-text-secondary)]">
                Required
                <Switch
                  checked={r.isRequired}
                  disabled={!canWrite || pending === r.field}
                  onCheckedChange={(v) => update(r.field, { isShown: r.isShown, isRequired: v })}
                  aria-label={`${LABELS[r.field]} required`}
                />
              </label>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
