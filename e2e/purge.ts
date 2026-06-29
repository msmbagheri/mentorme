import { PrismaClient } from "@prisma/client";

/**
 * Purge every E2E-created fixture. All test fixtures use a recognizable tag:
 *   - slugs:        e2e-service-* / e2e-case-* / e2e-team-* / e2e-event-* / e2e-page-*
 *   - emails:       e2e.user.*@example.com / e2e.lead.*@example.com
 *   - names/titles: "E2E " prefix (testimonials, logos, steps, value props, metrics, menu items, CTAs)
 *   - cta name:     e2e-cta-*
 *   - media file:   e2e-media-*
 *
 * Production runs MUST call this afterward so no test row/user is left on the
 * real DB. Returns the count of rows it removed (0 on a clean DB).
 */
export async function purgeE2E(db: PrismaClient): Promise<number> {
  let removed = 0;
  const e2eName = { startsWith: "E2E " } as const;

  // Leads (+ their activities): every test lead email starts with "e2e" (e2e.lead.*,
  // e2e_* from the public-form/rate-limit tests). Real-user emails never do.
  const leads = await db.lead.findMany({ where: { email: { startsWith: "e2e" } }, select: { id: true } });
  if (leads.length) {
    await db.leadActivity.deleteMany({ where: { leadId: { in: leads.map((l) => l.id) } } });
    removed += (await db.lead.deleteMany({ where: { id: { in: leads.map((l) => l.id) } } })).count;
  }
  // Test users (incl. the dedicated E2E runner account, all tagged e2e.user.*).
  removed += (await db.user.deleteMany({ where: { email: { startsWith: "e2e.user." } } })).count;

  // Slug-keyed content.
  removed += (await db.service.deleteMany({ where: { slug: { startsWith: "e2e-service-" } } })).count;
  removed += (await db.caseStudy.deleteMany({ where: { slug: { startsWith: "e2e-case-" } } })).count;
  removed += (await db.teamMember.deleteMany({ where: { slug: { startsWith: "e2e-team-" } } })).count;
  removed += (await db.event.deleteMany({ where: { slug: { startsWith: "e2e-event-" } } })).count;
  removed += (await db.page.deleteMany({ where: { slug: { startsWith: "e2e-page-" } } })).count;

  // Name/title-keyed repeatables.
  removed += (await db.testimonial.deleteMany({ where: { name: e2eName } })).count;
  removed += (await db.asSeenInLogo.deleteMany({ where: { title_en: e2eName } })).count;
  removed += (await db.methodologyStep.deleteMany({ where: { title_en: e2eName } })).count;
  removed += (await db.valueProposition.deleteMany({ where: { title_en: e2eName } })).count;
  removed += (await db.successMetric.deleteMany({ where: { metricLabel_en: e2eName } })).count;
  removed += (await db.menuItem.deleteMany({ where: { label_en: e2eName } })).count;
  removed += (await db.ctaConfig.deleteMany({ where: { internalName: { startsWith: "e2e-cta-" } } })).count;

  // Uploaded media.
  removed += (await db.mediaAsset.deleteMany({ where: { fileName: { startsWith: "e2e-media-" } } })).count;

  return removed;
}
