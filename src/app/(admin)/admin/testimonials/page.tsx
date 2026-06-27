import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listTestimonialsRaw } from "@/services/content.service";
import { ContentList } from "@/components/admin/ContentList";
import { CONTENT_MODULES } from "@/components/admin/content-config";
import { serializeRows } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function TestimonialsAdminPage() {
  const session = await requireCan("testimonials", "read");
  const rows = serializeRows(await listTestimonialsRaw());
  return (
    <ContentList
      config={CONTENT_MODULES.testimonials}
      rows={rows}
      canWrite={can(session.role, "update", "testimonials")}
      canPublish={can(session.role, "publish", "testimonials")}
      canDelete={can(session.role, "delete", "testimonials")}
    />
  );
}
