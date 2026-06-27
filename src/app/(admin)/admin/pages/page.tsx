import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listPagesRaw } from "@/services/content.service";
import { ContentList } from "@/components/admin/ContentList";
import { CONTENT_MODULES } from "@/components/admin/content-config";
import { serializeRows } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function PagesAdminPage() {
  const session = await requireCan("pages", "read");
  const rows = serializeRows(await listPagesRaw());
  return (
    <ContentList
      config={CONTENT_MODULES.pages}
      rows={rows}
      canWrite={can(session.role, "update", "pages")}
      canPublish={can(session.role, "publish", "pages")}
      canDelete={can(session.role, "delete", "pages")}
    />
  );
}
