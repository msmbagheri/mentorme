import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listTeamMembersRaw, listTeamCategoriesRaw } from "@/services/content.service";
import { ContentList } from "@/components/admin/ContentList";
import { CONTENT_MODULES } from "@/components/admin/content-config";
import { serializeRows } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function TeamAdminPage() {
  const session = await requireCan("team", "read");
  const [members, categories] = await Promise.all([
    listTeamMembersRaw(),
    listTeamCategoriesRaw(),
  ]);
  const rows = serializeRows(members);
  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.title_en,
  }));
  return (
    <ContentList
      config={CONTENT_MODULES.team}
      rows={rows}
      canWrite={can(session.role, "update", "team")}
      canPublish={can(session.role, "publish", "team")}
      canDelete={can(session.role, "delete", "team")}
      selectOptions={{ categoryId: categoryOptions }}
    />
  );
}
