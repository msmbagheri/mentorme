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
import { ContentEditor } from "@/components/admin/ContentEditor";
import { HOMEPAGE_SINGLETONS } from "@/components/admin/content-config";
import { SECTION_FONT_OPTIONS } from "@/lib/fonts";

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
  cardsPerRow: number;
  bgColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  header: SectionHeader;
}

/** Sections whose repeatable cards expose a "cards per row" carousel control. */
const CARDS_PER_ROW_SECTIONS = new Set([
  "why_choose_us",
  "services",
  "success_stories",
  "team",
  "events",
]);
const CARDS_PER_ROW_OPTIONS = [1, 2, 3, 4] as const;

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

/**
 * Editor deep-links for sections that map to managed modules. A section can map
 * to MORE THAN ONE module (e.g. Why Choose Us is built from testimonials AND the
 * value-prop cards), so each entry is a labelled list.
 */
const SECTION_LINKS: Record<string, { href: string; label: string }[]> = {
  services: [{ href: "/admin/services", label: "Edit" }],
  success_stories: [{ href: "/admin/case-studies", label: "Edit" }],
  team: [{ href: "/admin/team", label: "Edit" }],
  events: [{ href: "/admin/events", label: "Edit" }],
  why_choose_us: [
    { href: "/admin/testimonials", label: "Testimonials" },
    { href: "/admin/value-props", label: "Value cards" },
  ],
  as_seen_in: [{ href: "/admin/as-seen-in", label: "Edit" }],
  methodology: [{ href: "/admin/methodology", label: "Edit" }],
  footer: [{ href: "/admin/footer", label: "Edit" }],
};

/** Repeatable homepage content managers reachable from the builder header. */
const REPEATABLE_MANAGERS: { href: string; label: string }[] = [
  { href: "/admin/as-seen-in", label: "As Seen In logos" },
  { href: "/admin/methodology", label: "Methodology steps" },
  { href: "/admin/value-props", label: "Value propositions" },
  { href: "/admin/success-metrics", label: "Success metrics" },
  { href: "/admin/footer", label: "Footer settings" },
];

function ColorPick({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-caption text-[var(--color-text-muted)]">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={value || "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-10 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-transparent"
        />
        <span className="w-16 text-caption text-[var(--color-text-secondary)]">{value || "—"}</span>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-caption text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
            aria-label={`Clear ${label}`}
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SectionHeaderForm({
  sectionType,
  pageSlug,
  initial,
  initialCardsPerRow,
  initialColors,
  initialFont,
  showHeaderCopy,
  canWrite,
  onSaved,
}: {
  sectionType: string;
  pageSlug: string;
  initial: SectionHeader;
  initialCardsPerRow: number;
  initialColors: { bgColor: string; textColor: string; accentColor: string };
  initialFont: string;
  /** Whether this section's eyebrow/title/description copy lives on HomepageSection. */
  showHeaderCopy: boolean;
  canWrite: boolean;
  onSaved: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<SectionHeader>(initial);
  const [cardsPerRow, setCardsPerRow] = React.useState<number>(initialCardsPerRow);
  const [colors, setColors] = React.useState(initialColors);
  const [font, setFont] = React.useState(initialFont);
  const [saving, setSaving] = React.useState(false);
  const showCardsPerRow = CARDS_PER_ROW_SECTIONS.has(sectionType);

  React.useEffect(() => {
    setForm(initial);
  }, [initial]);
  React.useEffect(() => {
    setCardsPerRow(initialCardsPerRow);
  }, [initialCardsPerRow]);
  React.useEffect(() => {
    setColors(initialColors);
  }, [initialColors]);
  React.useEffect(() => {
    setFont(initialFont);
  }, [initialFont]);

  function change(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    const res = await runMutation(
      () =>
        apiClient.patch("/api/admin/homepage", {
          sectionType,
          pageSlug,
          // Header copy only lives on HomepageSection for header-editable sections;
          // singletons keep their copy on their own record, so send an empty header.
          header: showHeaderCopy
            ? form
            : {
                eyebrow_en: "",
                eyebrow_fa: "",
                title_en: "",
                title_fa: "",
                description_en: "",
                description_fa: "",
              },
          ...(showCardsPerRow ? { cardsPerRow } : {}),
          bgColor: colors.bgColor,
          textColor: colors.textColor,
          accentColor: colors.accentColor,
          fontFamily: font,
        }),
      { success: "Section updated", error: "Could not update section" },
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
        Content &amp; style
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div className="flex flex-col gap-4 px-4 pb-4">
          {showHeaderCopy ? (
            <>
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
            </>
          ) : (
            <p className="text-caption text-[var(--color-text-muted)]">
              Edit this section&apos;s text &amp; images via “Edit content” above. Colors and
              font below apply to the whole section.
            </p>
          )}
          {showCardsPerRow ? (
            <label className="flex flex-col gap-1.5 text-small font-semibold text-[var(--color-text-secondary)]">
              Cards per row
              <select
                value={cardsPerRow}
                onChange={(e) => setCardsPerRow(Number(e.target.value))}
                className="h-10 w-full max-w-[12rem] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-body text-[var(--color-text-primary)]"
              >
                {CARDS_PER_ROW_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "card" : "cards"} per row
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="flex flex-col gap-2">
            <span className="text-small font-semibold text-[var(--color-text-secondary)]">
              Section colors (optional — leave empty to use the theme)
            </span>
            <div className="flex flex-wrap gap-5">
              <ColorPick
                label="Background"
                value={colors.bgColor}
                onChange={(v) => setColors((c) => ({ ...c, bgColor: v }))}
              />
              <ColorPick
                label="Text"
                value={colors.textColor}
                onChange={(v) => setColors((c) => ({ ...c, textColor: v }))}
              />
              <ColorPick
                label="Accent / buttons"
                value={colors.accentColor}
                onChange={(v) => setColors((c) => ({ ...c, accentColor: v }))}
              />
            </div>
          </div>
          <label className="flex flex-col gap-1.5 text-small font-semibold text-[var(--color-text-secondary)]">
            Section font (optional — leave on default to use the theme)
            <select
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="h-10 w-full max-w-[16rem] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-body text-[var(--color-text-primary)]"
            >
              {SECTION_FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          {canWrite ? (
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save section"}
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
  singletons = {},
  canWrite,
  pageSlug = "home",
  isHome = true,
  pages = [],
}: {
  sections: SectionRow[];
  singletons?: Record<string, Record<string, unknown> | null>;
  canWrite: boolean;
  pageSlug?: string;
  isHome?: boolean;
  pages?: { slug: string; title: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<string | null>(null);

  async function toggle(sectionType: string, isActive: boolean) {
    setPending(sectionType);
    const res = await runMutation(
      () => apiClient.patch("/api/admin/homepage", { sectionType, isActive, pageSlug }),
      { success: "Page updated", error: "Could not update section" },
    );
    setPending(null);
    if (res) router.refresh();
  }

  // On non-home pages only the shared, header-editable sections are composable;
  // the singleton sections (hero/final CTA/…) need per-page content we don't
  // support yet, so hide them there.
  const visibleSections = isHome
    ? sections
    : sections.filter((s) => HEADER_EDITABLE.has(s.sectionType));

  return (
    <div>
      <PageHeader
        title={isHome ? "Homepage Builder" : "Page Builder"}
        description={
          isHome
            ? "Toggle section visibility. The trust-flow order is fixed."
            : "Enable sections on this page and set their copy, colors and layout. Sections use the site's shared content."
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="text-small font-semibold text-[var(--color-text-secondary)]">
          Editing page:
        </label>
        <select
          value={pageSlug}
          onChange={(e) => {
            const slug = e.target.value;
            router.push(slug === "home" ? "/admin/homepage" : `/admin/homepage?page=${slug}`);
          }}
          className="h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-body text-[var(--color-text-primary)]"
        >
          <option value="home">Homepage</option>
          {pages.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title} (/{p.slug})
            </option>
          ))}
        </select>
        <Link
          href="/admin/pages"
          className="text-small font-medium text-[var(--brand-primary)] hover:underline"
        >
          + New page
        </Link>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {REPEATABLE_MANAGERS.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-small font-medium text-[var(--color-text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
          >
            <Pencil className="size-3.5" /> {m.label}
          </Link>
        ))}
      </div>
      {!canWrite ? <ReadOnlyNotice className="mb-4" /> : null}

      <Card>
        <CardContent className="p-0">
          <ol className="flex flex-col divide-y divide-[var(--color-border)]">
            {visibleSections.map((s) => {
              const links = SECTION_LINKS[s.sectionType];
              const singletonConfig = HOMEPAGE_SINGLETONS[s.sectionType];
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
                  {singletonConfig ? (
                    <button
                      type="button"
                      onClick={() => setEditing(s.sectionType)}
                      className="inline-flex items-center gap-1 text-small font-semibold text-[var(--brand-primary)] hover:underline"
                    >
                      <Pencil className="size-4" /> Edit content
                    </button>
                  ) : links && links.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {links.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          className="inline-flex items-center gap-1 text-small font-semibold text-[var(--brand-primary)] hover:underline"
                        >
                          <Pencil className="size-4" /> {l.label}
                        </Link>
                      ))}
                    </div>
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
                  <SectionHeaderForm
                    sectionType={s.sectionType}
                    pageSlug={pageSlug}
                    initial={s.header}
                    initialCardsPerRow={s.cardsPerRow}
                    initialColors={{
                      bgColor: s.bgColor,
                      textColor: s.textColor,
                      accentColor: s.accentColor,
                    }}
                    initialFont={s.fontFamily}
                    showHeaderCopy={HEADER_EDITABLE.has(s.sectionType)}
                    canWrite={canWrite}
                    onSaved={() => router.refresh()}
                  />
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>

      {editing && HOMEPAGE_SINGLETONS[editing] ? (
        <ContentEditor
          config={HOMEPAGE_SINGLETONS[editing]}
          record={singletons[editing] ?? null}
          open
          onOpenChange={(o) => {
            if (!o) setEditing(null);
          }}
          canWrite={canWrite}
          canPublish={false}
          selectOptions={{}}
        />
      ) : null}
    </div>
  );
}
