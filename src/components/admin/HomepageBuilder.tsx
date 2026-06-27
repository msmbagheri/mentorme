"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GripVertical, Pencil, Lock, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient, runMutation } from "@/lib/admin-client";
import {
  PageHeader,
  ReadOnlyNotice,
  BilingualField,
} from "@/components/admin/shared";

interface SectionHeader {
  eyebrow_en: string;
  eyebrow_fa: string;
  title_en: string;
  title_fa: string;
  description_en: string;
  description_fa: string;
}

interface SectionRow {
  sectionType: string;
  orderIndex: number;
  isActive: boolean;
  header: SectionHeader;
}

/** Sections whose CMS header copy (eyebrow/title/description) is editable here. */
const HEADER_EDITABLE = new Set([
  "as_seen_in",
  "methodology",
  "why_choose_us",
  "services",
  "success_stories",
  "team",
  "events",
]);

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  as_seen_in: "As Seen In",
  methodology: "Methodology",
  why_choose_us: "Why Choose Us",
  brand_philosophy: "Brand Philosophy",
  services: "Services",
  success_stories: "Success Stories",
  founder_message: "Founder Message",
  team: "Team",
  events: "Events",
  final_cta: "Final CTA",
  footer: "Footer",
};

/** Editor deep-links for sections that map to a managed module. */
const SECTION_LINKS: Record<string, string> = {
  services: "/admin/services",
  success_stories: "/admin/case-studies",
  team: "/admin/team",
  events: "/admin/events",
  why_choose_us: "/admin/testimonials",
  as_seen_in: "/admin/media",
};

function SectionHeaderForm({
  sectionType,
  initial,
  canWrite,
  onSaved,
}: {
  sectionType: string;
  initial: SectionHeader;
  canWrite: boolean;
  onSaved: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<SectionHeader>(initial);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setForm(initial);
  }, [initial]);

  function change(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    const res = await runMutation(
      () =>
        apiClient.patch("/api/admin/homepage", {
          sectionType,
          header: form,
        }),
      { success: "Header updated", error: "Could not update header" },
    );
    setSaving(false);
    if (res) onSaved();
  }

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-2 text-small font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      >
        Section header copy
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="flex flex-col gap-4 px-4 pb-4">
          <BilingualField
            label="Eyebrow"
            baseName={`${sectionType}_eyebrow`}
            valueEn={form.eyebrow_en}
            valueFa={form.eyebrow_fa}
            onChange={(k, v) =>
              change(k.replace(`${sectionType}_eyebrow_`, "eyebrow_"), v)
            }
          />
          <BilingualField
            label="Title"
            baseName={`${sectionType}_title`}
            valueEn={form.title_en}
            valueFa={form.title_fa}
            onChange={(k, v) =>
              change(k.replace(`${sectionType}_title_`, "title_"), v)
            }
          />
          <BilingualField
            label="Description"
            baseName={`${sectionType}_description`}
            valueEn={form.description_en}
            valueFa={form.description_fa}
            textarea
            onChange={(k, v) =>
              change(
                k.replace(`${sectionType}_description_`, "description_"),
                v,
              )
            }
          />
          {canWrite ? (
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save header"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function HomepageBuilder({
  sections,
  canWrite,
}: {
  sections: SectionRow[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState<string | null>(null);

  async function toggle(sectionType: string, isActive: boolean) {
    setPending(sectionType);
    const res = await runMutation(
      () => apiClient.patch("/api/admin/homepage", { sectionType, isActive }),
      { success: "Homepage updated", error: "Could not update section" },
    );
    setPending(null);
    if (res) router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Homepage Builder"
        description="Toggle section visibility. The trust-flow order is fixed and cannot be changed."
      />
      {!canWrite ? <ReadOnlyNotice className="mb-4" /> : null}

      <Card>
        <CardContent className="p-0">
          <ol className="flex flex-col divide-y divide-[var(--color-border)]">
            {sections.map((s) => {
              const link = SECTION_LINKS[s.sectionType];
              return (
                <li key={s.sectionType} className="flex flex-col">
                  <div className="flex items-center gap-3 p-4">
                  <span
                    className="flex size-7 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-surface-alt)] text-caption font-bold text-[var(--color-text-muted)]"
                    aria-hidden
                  >
                    {String(s.orderIndex + 1).padStart(2, "0")}
                  </span>
                  <GripVertical
                    className="size-4 text-[var(--color-text-muted)] opacity-40"
                    aria-hidden
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[var(--color-text-primary)]">
                      {SECTION_LABELS[s.sectionType] ?? s.sectionType}
                    </div>
                  </div>
                  {s.isActive ? (
                    <Badge variant="success">Visible</Badge>
                  ) : (
                    <Badge variant="neutral">Hidden</Badge>
                  )}
                  {link ? (
                    <Link
                      href={link}
                      className="inline-flex items-center gap-1 text-small font-semibold text-[var(--brand-primary)] hover:underline"
                    >
                      <Pencil className="size-4" /> Edit
                    </Link>
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 text-caption text-[var(--color-text-muted)]"
                      title="Edit via the relevant content module"
                    >
                      <Lock className="size-3.5" /> Locked order
                    </span>
                  )}
                  <Switch
                    checked={s.isActive}
                    disabled={!canWrite || pending === s.sectionType}
                    onCheckedChange={(v) => toggle(s.sectionType, v)}
                    aria-label={`Toggle ${s.sectionType} visibility`}
                  />
                  </div>
                  {HEADER_EDITABLE.has(s.sectionType) ? (
                    <SectionHeaderForm
                      sectionType={s.sectionType}
                      initial={s.header}
                      canWrite={canWrite}
                      onSaved={() => router.refresh()}
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
