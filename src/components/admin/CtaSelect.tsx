"use client";

import * as React from "react";
import { Select } from "@/components/ui/select";
import { apiClient } from "@/lib/admin-client";

interface CtaRow {
  id: string;
  internalName: string;
  label_en: string;
}

let cache: CtaRow[] | null = null;

/** A select bound to CtaConfig records. Value is the cta id (or empty). */
export function CtaSelect({
  value,
  onChange,
  id,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  id?: string;
}) {
  const [ctas, setCtas] = React.useState<CtaRow[]>(cache ?? []);

  React.useEffect(() => {
    if (cache) return;
    apiClient
      .get<CtaRow[]>("/api/admin/cta")
      .then((rows) => {
        cache = rows;
        setCtas(rows);
      })
      .catch(() => setCtas([]));
  }, []);

  return (
    <Select
      id={id}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">— None —</option>
      {ctas.map((c) => (
        <option key={c.id} value={c.id}>
          {c.internalName} ({c.label_en})
        </option>
      ))}
    </Select>
  );
}
