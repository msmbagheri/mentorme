import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listCaseStudiesRaw } from "@/services/content.service";
import { ContentList } from "@/components/admin/ContentList";
import { CONTENT_MODULES } from "@/components/admin/content-config";
import { serializeRows } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function CaseStudiesAdminPage() {
  const session = await requireCan("case-studies", "read");
  const rows = serializeRows(await listCaseStudiesRaw());
  return (
    <ContentList
      config={CONTENT_MODULES["case-studies"]}
      rows={rows}
      canWrite={can(session.role, "update", "case-studies")}
      canPublish={can(session.role, "publish", "case-studies")}
      canDelete={can(session.role, "delete", "case-studies")}
    />
  );
}
