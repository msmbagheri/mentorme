import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listHomepageSections } from "@/services/homepage.service";
import {
  getHeroRaw,
  getBrandPhilosophyRaw,
  getFounderMessageRaw,
  getFinalCtaRaw,
} from "@/services/content.service";
import { HomepageBuilder } from "@/components/admin/HomepageBuilder";

export const dynamic = "force-dynamic";

export default async function HomepageAdminPage() {
  const session = await requireCan("homepage", "read");
  const [sections, hero, brandPhilosophy, founderMessage, finalCta] = await Promise.all([
    listHomepageSections(),
    getHeroRaw(),
    getBrandPhilosophyRaw(),
    getFounderMessageRaw(),
    getFinalCtaRaw(),
  ]);
  // Singleton section records keyed by sectionType, fed to the in-place editor.
  const singletons: Record<string, Record<string, unknown> | null> = {
    hero,
    brand_philosophy: brandPhilosophy,
    founder_message: founderMessage,
    final_cta: finalCta,
  };
  return (
    <HomepageBuilder
      sections={sections.map((s) => ({
        sectionType: s.sectionType,
        orderIndex: s.orderIndex,
        isActive: s.isActive,
        header: s.header,
      }))}
      singletons={JSON.parse(JSON.stringify(singletons))}
      canWrite={can(session.role, "update", "homepage")}
    />
  );
}
