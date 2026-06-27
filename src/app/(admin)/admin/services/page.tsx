import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listServicesRaw } from "@/services/content.service";
import { ContentList } from "@/components/admin/ContentList";
import { CONTENT_MODULES } from "@/components/admin/content-config";
import { serializeRows } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function ServicesAdminPage() {
  const session = await requireCan("services", "read");
  const rows = serializeRows(await listServicesRaw());
  return (
    <ContentList
      config={CONTENT_MODULES.services}
      rows={rows}
      canWrite={can(session.role, "update", "services")}
      canPublish={can(session.role, "publish", "services")}
      canDelete={can(session.role, "delete", "services")}
    />
  );
}
