import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listEventsRaw } from "@/services/content.service";
import { ContentList } from "@/components/admin/ContentList";
import { CONTENT_MODULES } from "@/components/admin/content-config";
import { serializeRows } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function EventsAdminPage() {
  const session = await requireCan("events", "read");
  const rows = serializeRows(await listEventsRaw());
  return (
    <ContentList
      config={CONTENT_MODULES.events}
      rows={rows}
      canWrite={can(session.role, "update", "events")}
      canPublish={can(session.role, "publish", "events")}
      canDelete={can(session.role, "delete", "events")}
    />
  );
}
