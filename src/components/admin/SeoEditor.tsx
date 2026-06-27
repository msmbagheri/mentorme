"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient, runMutation } from "@/lib/admin-client";
import { PageHeader, Field, SwitchRow, ReadOnlyNotice } from "@/components/admin/shared";
import { MediaPicker } from "@/components/admin/MediaPicker";

interface PageRow {
  id: string;
  slug: string;
  title_en: string;
}

interface SeoSetting {
  pageId: string;
  metaTitle_en: string | null;
  metaTitle_fa: string | null;
  metaDescription_en: string | null;
  metaDescription_fa: string | null;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  noIndex: boolean;
  noFollow: boolean;
}

function blank(pageId: string): SeoSetting {
  return {
    pageId,
    metaTitle_en: "",
    metaTitle_fa: "",
    metaDescription_en: "",
    metaDescription_fa: "",
    canonicalUrl: "",
    ogImageUrl: "",
    noIndex: false,
    noFollow: false,
  };
}

export function SeoEditor({
  pages,
  settings,
  canWrite,
}: {
  pages: PageRow[];
  settings: Record<string, SeoSetting>;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [pageId, setPageId] = React.useState(pages[0]?.id ?? "");
  const [state, setState] = React.useState<SeoSetting>(
    pages[0] ? settings[pages[0].id] ?? blank(pages[0].id) : blank(""),
  );

  React.useEffect(() => {
    if (pageId) setState(settings[pageId] ?? blank(pageId));
  }, [pageId, settings]);

  const set = <K extends keyof SeoSetting>(key: K, value: SeoSetting[K]) =>
    setState((p) => ({ ...p, [key]: value }));

  async function save() {
    const res = await runMutation(
      () =>
        apiClient.post("/api/admin/seo", {
          pageId: state.pageId,
          metaTitle_en: state.metaTitle_en || null,
          metaTitle_fa: state.metaTitle_fa || null,
          metaDescription_en: state.metaDescription_en || null,
          metaDescription_fa: state.metaDescription_fa || null,
          canonicalUrl: state.canonicalUrl || null,
          ogImageUrl: state.ogImageUrl || null,
          noIndex: state.noIndex,
          noFollow: state.noFollow,
        }),
      { success: "SEO saved", error: "Could not save SEO" },
    );
    if (res) router.refresh();
  }

  return (
    <div>
      <PageHeader title="SEO" description="Per-page meta tags, social images and indexing.">
        {canWrite ? (
          <Button variant="cta" size="sm" onClick={save}>
            <Save className="size-4" /> Save
          </Button>
        ) : null}
      </PageHeader>
      {!canWrite ? <ReadOnlyNotice className="mb-4" /> : null}

      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <Field label="Page" htmlFor="seo-page">
            <Select id="seo-page" value={pageId} onChange={(e) => setPageId(e.target.value)}>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title_en} (/{p.slug})
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Meta title (EN)" htmlFor="mt-en">
              <Input id="mt-en" value={state.metaTitle_en ?? ""} disabled={!canWrite} onChange={(e) => set("metaTitle_en", e.target.value)} />
            </Field>
            <Field label="Meta title (FA)" htmlFor="mt-fa">
              <Input id="mt-fa" dir="rtl" value={state.metaTitle_fa ?? ""} disabled={!canWrite} onChange={(e) => set("metaTitle_fa", e.target.value)} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Meta description (EN)" htmlFor="md-en">
              <Textarea id="md-en" value={state.metaDescription_en ?? ""} disabled={!canWrite} onChange={(e) => set("metaDescription_en", e.target.value)} />
            </Field>
            <Field label="Meta description (FA)" htmlFor="md-fa">
              <Textarea id="md-fa" dir="rtl" value={state.metaDescription_fa ?? ""} disabled={!canWrite} onChange={(e) => set("metaDescription_fa", e.target.value)} />
            </Field>
          </div>
          <Field label="Canonical URL" htmlFor="canon">
            <Input id="canon" dir="ltr" value={state.canonicalUrl ?? ""} disabled={!canWrite} onChange={(e) => set("canonicalUrl", e.target.value)} />
          </Field>
          <MediaPicker label="OG image" value={state.ogImageUrl ?? ""} onChange={(v) => set("ogImageUrl", v)} />
          <SwitchRow
            label="No index"
            description="Prevent search engines from indexing this page."
            checked={state.noIndex}
            onCheckedChange={(v) => set("noIndex", v)}
            disabled={!canWrite}
          />
          <SwitchRow
            label="No follow"
            description="Prevent search engines from following links on this page."
            checked={state.noFollow}
            onCheckedChange={(v) => set("noFollow", v)}
            disabled={!canWrite}
          />
        </CardContent>
      </Card>
    </div>
  );
}
