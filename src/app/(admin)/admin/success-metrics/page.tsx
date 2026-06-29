import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listSuccessMetricsRaw, getHomepagePageId } from "@/services/content.service";
import { ContentList } from "@/components/admin/ContentList";
import { CONTENT_MODULES } from "@/components/admin/content-config";
import { serializeRows } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function SuccessMetricsAdminPage() {
  const session = await requireCan("homepage", "read");
  const [rows, pageId] = await Promise.all([
    serializeRows(await listSuccessMetricsRaw()),
    getHomepagePageId(),
  ]);
  return (
    <ContentList
      config={CONTENT_MODULES["success-metrics"]}
      rows={rows}
      canWrite={can(session.role, "update", "homepage")}
      canPublish={can(session.role, "publish", "homepage")}
      canDelete={can(session.role, "delete", "homepage")}
      createDefaults={pageId ? { pageId } : undefined}
    />
  );
}
