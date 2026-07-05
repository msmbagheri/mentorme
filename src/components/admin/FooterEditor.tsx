"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient, runMutation } from "@/lib/admin-client";
import { PageHeader, Field, BilingualField, ReadOnlyNotice } from "@/components/admin/shared";

interface SocialLink {
  platform: string;
  url: string;
}

export interface FooterState {
  id: string | null;
  tagline_en: string;
  tagline_fa: string;
  description_en: string;
  description_fa: string;
  copyright_en: string;
  copyright_fa: string;
  address_en: string;
  address_fa: string;
  contactEmail: string;
  contactPhone: string;
  businessHours_en: string;
  businessHours_fa: string;
  socialLinks: SocialLink[];
  footerMenuId: string;
  servicesMenuId: string;
  servicesHeading_en: string;
  servicesHeading_fa: string;
}

interface MenuOption {
  id: string;
  internalName: string;
}

export function FooterEditor({
  footer,
  menus,
  canWrite,
}: {
  footer: FooterState;
  menus: MenuOption[];
  canWrite: boolean;
}) {
  const router = useRouter();
  const [state, setState] = React.useState<FooterState>(footer);
  const [saving, setSaving] = React.useState(false);

  const set = <K extends keyof FooterState>(key: K, value: FooterState[K]) =>
    setState((p) => ({ ...p, [key]: value }));

  async function save() {
    setSaving(true);
    const payload = {
      tagline_en: state.tagline_en,
      tagline_fa: state.tagline_fa,
      description_en: state.description_en,
      description_fa: state.description_fa,
      copyright_en: state.copyright_en,
      copyright_fa: state.copyright_fa,
      address_en: state.address_en,
      address_fa: state.address_fa,
      contactEmail: state.contactEmail,
      contactPhone: state.contactPhone,
      businessHours_en: state.businessHours_en,
      businessHours_fa: state.businessHours_fa,
      // Drop incomplete rows; the schema requires a platform + valid URL.
      socialLinks: state.socialLinks.filter((s) => s.platform && s.url),
      // footerMenuId must be a uuid or null — never an empty string.
      footerMenuId: state.footerMenuId || null,
      servicesMenuId: state.servicesMenuId || null,
      servicesHeading_en: state.servicesHeading_en,
      servicesHeading_fa: state.servicesHeading_fa,
    };

    const res = await runMutation(
      () =>
        state.id
          ? apiClient.patch("/api/admin/content", {
              entityType: "FooterSetting",
              data: { id: state.id, ...payload },
            })
          : apiClient.post("/api/admin/content", {
              entityType: "FooterSetting",
              data: payload,
            }),
      { success: "Footer saved", error: "Could not save footer" },
    );
    setSaving(false);
    if (res) router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Footer"
        description="Contact details, footer navigation, copyright and social links."
      >
        {canWrite ? (
          <Button variant="cta" size="sm" onClick={save} disabled={saving}>
            <Save className="size-4" /> {saving ? "Saving…" : "Save"}
          </Button>
        ) : null}
      </PageHeader>
      {!canWrite ? <ReadOnlyNotice className="mb-4" /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-h4">About</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <BilingualField
              label="Tagline"
              baseName="tagline"
              valueEn={state.tagline_en}
              valueFa={state.tagline_fa}
              onChange={(k, v) => set(k as keyof FooterState, v)}
            />
            <BilingualField
              label="Description"
              baseName="description"
              valueEn={state.description_en}
              valueFa={state.description_fa}
              textarea
              onChange={(k, v) => set(k as keyof FooterState, v)}
            />
            <BilingualField
              label="Copyright"
              baseName="copyright"
              valueEn={state.copyright_en}
              valueFa={state.copyright_fa}
              onChange={(k, v) => set(k as keyof FooterState, v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-h4">Contact</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field label="Contact email" htmlFor="f-email">
              <Input
                id="f-email"
                dir="ltr"
                type="email"
                value={state.contactEmail}
                disabled={!canWrite}
                onChange={(e) => set("contactEmail", e.target.value)}
              />
            </Field>
            <Field label="Contact phone" htmlFor="f-phone">
              <Input
                id="f-phone"
                dir="ltr"
                value={state.contactPhone}
                disabled={!canWrite}
                onChange={(e) => set("contactPhone", e.target.value)}
              />
            </Field>
            <BilingualField
              label="Address"
              baseName="address"
              valueEn={state.address_en}
              valueFa={state.address_fa}
              textarea
              onChange={(k, v) => set(k as keyof FooterState, v)}
            />
            <BilingualField
              label="Business hours"
              baseName="businessHours"
              valueEn={state.businessHours_en}
              valueFa={state.businessHours_fa}
              onChange={(k, v) => set(k as keyof FooterState, v)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-h4">Footer navigation</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field
              label="Footer menu"
              htmlFor="f-menu"
              hint="Choose which menu drives the footer links. Manage its items under Menus."
            >
              <select
                id="f-menu"
                value={state.footerMenuId}
                disabled={!canWrite}
                onChange={(e) => set("footerMenuId", e.target.value)}
                className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-body text-[var(--color-text-primary)] disabled:opacity-50"
              >
                <option value="">— None —</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.internalName}
                  </option>
                ))}
              </select>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-h4">Related services column</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field
              label="Services menu"
              htmlFor="f-services-menu"
              hint="Choose a menu to drive the footer “Related services” links. Leave as “Auto” to list published services. Manage menu items under Menus."
            >
              <select
                id="f-services-menu"
                value={state.servicesMenuId}
                disabled={!canWrite}
                onChange={(e) => set("servicesMenuId", e.target.value)}
                className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-body text-[var(--color-text-primary)] disabled:opacity-50"
              >
                <option value="">— Auto (published services) —</option>
                {menus.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.internalName}
                  </option>
                ))}
              </select>
            </Field>
            <BilingualField
              label="Column heading"
              baseName="servicesHeading"
              valueEn={state.servicesHeading_en}
              valueFa={state.servicesHeading_fa}
              onChange={(k, v) => set(k as keyof FooterState, v)}
            />
          </CardContent>
        </Card>

        <Card>
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
                <Field label="Platform" htmlFor={`fsp-${i}`}>
                  <Input
                    id={`fsp-${i}`}
                    value={link.platform}
                    disabled={!canWrite}
                    placeholder="linkedin"
                    onChange={(e) => {
                      const next = [...state.socialLinks];
                      next[i] = { ...next[i], platform: e.target.value };
                      set("socialLinks", next);
                    }}
                  />
                </Field>
                <Field label="URL" htmlFor={`fsu-${i}`}>
                  <Input
                    id={`fsu-${i}`}
                    dir="ltr"
                    value={link.url}
                    disabled={!canWrite}
                    placeholder="https://…"
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
