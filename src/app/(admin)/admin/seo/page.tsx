import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listPagesRaw } from "@/services/content.service";
import { listSeoSettings } from "@/services/seo.service";
import { SeoEditor } from "@/components/admin/SeoEditor";
import { serializeRows } from "@/lib/serialize";
import { EmptyState, PageHeader } from "@/components/admin/shared";

export const dynamic = "force-dynamic";

export default async function SeoAdminPage() {
  const session = await requireCan("seo", "read");
  const [pages, seoRows] = await Promise.all([listPagesRaw(), listSeoSettings()]);

  if (pages.length === 0) {
    return (
      <div>
        <PageHeader title="SEO" />
        <EmptyState title="No pages yet" description="Create pages first to manage their SEO." />
      </div>
    );
  }

  const settings: Record<string, ReturnType<typeof serializeRows>[number]> = {};
  for (const s of serializeRows(seoRows)) {
    settings[(s as { pageId: string }).pageId] = s;
  }

  return (
    <SeoEditor
      pages={pages.map((p) => ({ id: p.id, slug: p.slug, title_en: p.title_en }))}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      settings={settings as any}
      canWrite={can(session.role, "update", "seo")}
    />
  );
}
