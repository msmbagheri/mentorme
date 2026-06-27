import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listMedia } from "@/services/media.service";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { serializeRows } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function MediaAdminPage() {
  const session = await requireCan("media", "read");
  const { items } = await listMedia({ pageSize: 100 });
  return (
    <MediaLibrary
      initialItems={serializeRows(items)}
      canWrite={can(session.role, "create", "media")}
      canDelete={can(session.role, "delete", "media")}
    />
  );
}
