import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listHomepageSections } from "@/services/homepage.service";
import { HomepageBuilder } from "@/components/admin/HomepageBuilder";

export const dynamic = "force-dynamic";

export default async function HomepageAdminPage() {
  const session = await requireCan("homepage", "read");
  const sections = await listHomepageSections();
  return (
    <HomepageBuilder
      sections={sections.map((s) => ({
        sectionType: s.sectionType,
        orderIndex: s.orderIndex,
        isActive: s.isActive,
        header: s.header,
      }))}
      canWrite={can(session.role, "update", "homepage")}
    />
  );
}
