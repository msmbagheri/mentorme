import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listAsSeenInLogosRaw } from "@/services/content.service";
import { ContentList } from "@/components/admin/ContentList";
import { CONTENT_MODULES } from "@/components/admin/content-config";
import { serializeRows } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function AsSeenInAdminPage() {
  const session = await requireCan("homepage", "read");
  const rows = serializeRows(await listAsSeenInLogosRaw());
  return (
    <ContentList
      config={CONTENT_MODULES["as-seen-in"]}
      rows={rows}
      canWrite={can(session.role, "update", "homepage")}
      canPublish={can(session.role, "publish", "homepage")}
      canDelete={can(session.role, "delete", "homepage")}
    />
  );
}
