"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, runMutation } from "@/lib/admin-client";
import { PageHeader, Field, ReadOnlyNotice } from "@/components/admin/shared";
import { MediaPicker } from "@/components/admin/MediaPicker";

interface SocialLink {
  platform: string;
  url: string;
}

interface ThemeState {
  brandName: string;
  tagline_en: string;
  tagline_fa: string;
  primaryLogoUrl: string;
  darkLogoUrl: string;
  mobileLogoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  ctaGradientStart: string;
  ctaGradientEnd: string;
  fontFamilyLatin: string;
  fontFamilyPersian: string;
  fontUrlLatin: string;
  fontUrlPersian: string;
  socialLinks: SocialLink[];
  contactInformation: { email: string; phone: string; address: string; hours: string };
}

export function ThemeEditor({
  theme,
  canWrite,
}: {
  theme: ThemeState;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [state, setState] = React.useState<ThemeState>(theme);
  const [saving, setSaving] = React.useState(false);

  const set = <K extends keyof ThemeState>(key: K, value: ThemeState[K]) =>
    setState((p) => ({ ...p, [key]: value }));

  async function save() {
    setSaving(true);
    const res = await runMutation(
      () =>
        apiClient.post("/api/admin/theme", {
          brandName: state.brandName,
          tagline_en: state.tagline_en,
          tagline_fa: state.tagline_fa,
          primaryLogoUrl: state.primaryLogoUrl || null,
          darkLogoUrl: state.darkLogoUrl || null,
          mobileLogoUrl: state.mobileLogoUrl || null,
          faviconUrl: state.faviconUrl || null,
          primaryColor: state.primaryColor || null,
          accentColor: state.accentColor || null,
          ctaGradientStart: state.ctaGradientStart || null,
          ctaGradientEnd: state.ctaGradientEnd || null,
          fontFamilyLatin: state.fontFamilyLatin || null,
          fontFamilyPersian: state.fontFamilyPersian || null,
          fontUrlLatin: state.fontUrlLatin || null,
          fontUrlPersian: state.fontUrlPersian || null,
          socialLinks: state.socialLinks.filter((s) => s.platform && s.url),
          contactInformation: state.contactInformation,
        }),
      { success: "Theme saved", error: "Could not save theme" },
    );
    setSaving(false);
    if (res) router.refresh();
  }

  return (
    <div>
      <PageHeader title="Theme Manager" description="Brand identity, colors, logos and contact info.">
        {canWrite ? (
          <Button variant="cta" size="sm" onClick={save} disabled={saving}>
            <Save className="size-4" /> Save
          </Button>
        ) : null}
      </PageHeader>
      {!canWrite ? <ReadOnlyNotice className="mb-4" /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-h4">Brand</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field label="Brand name" htmlFor="brand" required>
              <Input id="brand" value={state.brandName} onChange={(e) => set("brandName", e.target.value)} disabled={!canWrite} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tagline (EN)" htmlFor="tag-en">
                <Input id="tag-en" value={state.tagline_en} onChange={(e) => set("tagline_en", e.target.value)} disabled={!canWrite} />
              </Field>
              <Field label="Tagline (FA)" htmlFor="tag-fa">
                <Input id="tag-fa" dir="rtl" value={state.tagline_fa} onChange={(e) => set("tagline_fa", e.target.value)} disabled={!canWrite} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-h4">Logos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <MediaPicker label="Primary logo" value={state.primaryLogoUrl} onChange={(v) => set("primaryLogoUrl", v)} />
            <MediaPicker label="Dark logo" value={state.darkLogoUrl} onChange={(v) => set("darkLogoUrl", v)} />
            <MediaPicker label="Mobile logo" value={state.mobileLogoUrl} onChange={(v) => set("mobileLogoUrl", v)} />
            <MediaPicker label="Favicon" value={state.faviconUrl} onChange={(v) => set("faviconUrl", v)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-h4">Colors</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <ColorField label="Primary" value={state.primaryColor} onChange={(v) => set("primaryColor", v)} disabled={!canWrite} />
            <ColorField label="Accent" value={state.accentColor} onChange={(v) => set("accentColor", v)} disabled={!canWrite} />
            <ColorField label="CTA gradient start" value={state.ctaGradientStart} onChange={(v) => set("ctaGradientStart", v)} disabled={!canWrite} />
            <ColorField label="CTA gradient end" value={state.ctaGradientEnd} onChange={(v) => set("ctaGradientEnd", v)} disabled={!canWrite} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-h4">Typography</CardTitle>
            {canWrite ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setState((p) => ({
                    ...p,
                    fontFamilyPersian: "Vazirmatn",
                    fontUrlPersian:
                      "https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css",
                  }))
                }
              >
                Use Vazirmatn (FA)
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Latin font family (en)" htmlFor="font-latin" hint="e.g. Inter, Poppins">
              <Input id="font-latin" dir="ltr" value={state.fontFamilyLatin} disabled={!canWrite}
                onChange={(e) => set("fontFamilyLatin", e.target.value)} placeholder="Inter" />
            </Field>
            <Field label="Persian font family (fa)" htmlFor="font-fa" hint="e.g. Vazirmatn, IRANSansX">
              <Input id="font-fa" dir="ltr" value={state.fontFamilyPersian} disabled={!canWrite}
                onChange={(e) => set("fontFamilyPersian", e.target.value)} placeholder="Vazirmatn" />
            </Field>
            <Field label="Latin font URL" htmlFor="font-latin-url" hint="@font-face CSS or font file (optional)">
              <Input id="font-latin-url" dir="ltr" value={state.fontUrlLatin} disabled={!canWrite}
                onChange={(e) => set("fontUrlLatin", e.target.value)} placeholder="https://…" />
            </Field>
            <Field label="Persian font URL" htmlFor="font-fa-url" hint="@font-face CSS or font file (optional)">
              <Input id="font-fa-url" dir="ltr" value={state.fontUrlPersian} disabled={!canWrite}
                onChange={(e) => set("fontUrlPersian", e.target.value)} placeholder="https://…" />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-h4">Contact</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field label="Email" htmlFor="c-email">
              <Input id="c-email" dir="ltr" value={state.contactInformation.email} disabled={!canWrite}
                onChange={(e) => set("contactInformation", { ...state.contactInformation, email: e.target.value })} />
            </Field>
            <Field label="Phone" htmlFor="c-phone">
              <Input id="c-phone" dir="ltr" value={state.contactInformation.phone} disabled={!canWrite}
                onChange={(e) => set("contactInformation", { ...state.contactInformation, phone: e.target.value })} />
            </Field>
            <Field label="Address" htmlFor="c-addr">
              <Input id="c-addr" value={state.contactInformation.address} disabled={!canWrite}
                onChange={(e) => set("contactInformation", { ...state.contactInformation, address: e.target.value })} />
            </Field>
            <Field label="Business hours" htmlFor="c-hours">
              <Input id="c-hours" value={state.contactInformation.hours} disabled={!canWrite}
                onChange={(e) => set("contactInformation", { ...state.contactInformation, hours: e.target.value })} />
            </Field>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-h4">Social links</CardTitle>
            {canWrite ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => set("socialLinks", [...state.socialLinks, { platform: "", url: "" }])}
              >
                <Plus className="size-4" /> Add
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {state.socialLinks.map((link, i) => (
              <div key={i} className="flex items-end gap-2">
                <Field label="Platform" htmlFor={`sp-${i}`}>
                  <Input
                    id={`sp-${i}`}
                    value={link.platform}
                    disabled={!canWrite}
                    onChange={(e) => {
                      const next = [...state.socialLinks];
                      next[i] = { ...next[i], platform: e.target.value };
                      set("socialLinks", next);
                    }}
                  />
                </Field>
                <Field label="URL" htmlFor={`su-${i}`}>
                  <Input
                    id={`su-${i}`}
                    dir="ltr"
                    value={link.url}
                    disabled={!canWrite}
                    onChange={(e) => {
                      const next = [...state.socialLinks];
                      next[i] = { ...next[i], url: e.target.value };
                      set("socialLinks", next);
                    }}
                  />
                </Field>
                {canWrite ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove"
                    onClick={() => set("socialLinks", state.socialLinks.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="size-4 text-[var(--color-error)]" />
                  </Button>
                ) : null}
              </div>
            ))}
            {state.socialLinks.length === 0 ? (
              <p className="text-small text-[var(--color-text-muted)]">No social links added.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const id = React.useId();
  return (
    <Field label={label} htmlFor={id}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} color picker`}
          value={value || "#000000"}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-transparent"
        />
        <Input id={id} dir="ltr" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} placeholder="#000000" />
      </div>
    </Field>
  );
}
