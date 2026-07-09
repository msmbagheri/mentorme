import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listHomepageSections, listBuilderPages } from "@/services/homepage.service";
import {
  getHeroRaw,
  getBrandPhilosophyRaw,
  getFounderMessageRaw,
  getFinalCtaRaw,
} from "@/services/content.service";
import { HomepageBuilder } from "@/components/admin/HomepageBuilder";

export const dynamic = "force-dynamic";

const HOME_SLUG = "home";

export default async function HomepageAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requireCan("homepage", "read");
  const { page: pageParam } = await searchParams;
  const pageSlug = pageParam && pageParam !== HOME_SLUG ? pageParam : HOME_SLUG;
  const isHome = pageSlug === HOME_SLUG;

  const [sections, builderPages, hero, brandPhilosophy, founderMessage, finalCta] =
    await Promise.all([
      listHomepageSections(pageSlug),
      listBuilderPages(),
      isHome ? getHeroRaw() : Promise.resolve(null),
      isHome ? getBrandPhilosophyRaw() : Promise.resolve(null),
      isHome ? getFounderMessageRaw() : Promise.resolve(null),
      isHome ? getFinalCtaRaw() : Promise.resolve(null),
    ]);

  // Singleton in-place editors only apply to the home page (their content is
  // page-scoped 1:1 and only the home rows exist today).
  const singletons: Record<string, Record<string, unknown> | null> = {
    hero,
    brand_philosophy: brandPhilosophy,
    founder_message: founderMessage,
    final_cta: finalCta,
  };
  return (
    <HomepageBuilder
      pageSlug={pageSlug}
      isHome={isHome}
      pages={builderPages.map((p) => ({ slug: p.slug, title: p.title }))}
      sections={sections.map((s) => ({
        sectionType: s.sectionType,
        orderIndex: s.orderIndex,
        isActive: s.isActive,
        cardsPerRow: s.cardsPerRow,
        bgColor: s.bgColor,
        textColor: s.textColor,
        accentColor: s.accentColor,
        fontFamily: s.fontFamily,
        cardBgColor: s.cardBgColor,
        fontScale: s.fontScale,
        header: s.header,
      }))}
      singletons={JSON.parse(JSON.stringify(singletons))}
      canWrite={can(session.role, "update", "homepage")}
    />
  );
}
