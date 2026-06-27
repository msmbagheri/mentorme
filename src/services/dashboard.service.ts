import "server-only";
import { prisma } from "@/lib/db";

/** Aggregate counts + recent activity for the admin dashboard. */
export async function getDashboardStats() {
  const [
    leadGroups,
    totalLeads,
    recentLeads,
    upcomingEvents,
    services,
    publishedServices,
    caseStudies,
    publishedCaseStudies,
    events,
    publishedEvents,
    teamMembers,
    activeTeamMembers,
  ] = await Promise.all([
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.lead.count(),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.event.findMany({
      where: { eventStatus: "PUBLISHED", startDate: { gte: new Date() } },
      orderBy: { startDate: "asc" },
      take: 5,
      select: { id: true, title_en: true, startDate: true },
    }),
    prisma.service.count(),
    prisma.service.count({ where: { status: "PUBLISHED" } }),
    prisma.caseStudy.count(),
    prisma.caseStudy.count({ where: { status: "PUBLISHED" } }),
    prisma.event.count(),
    prisma.event.count({ where: { eventStatus: "PUBLISHED" } }),
    prisma.teamMember.count(),
    prisma.teamMember.count({ where: { isActive: true } }),
  ]);

  return {
    leadCounts: leadGroups.map((g) => ({ status: g.status, count: g._count._all })),
    totalLeads,
    recentLeads: recentLeads.map((l) => ({
      id: l.id,
      firstName: l.firstName,
      lastName: l.lastName,
      email: l.email,
      status: l.status,
      createdAt: l.createdAt.toISOString(),
    })),
    upcomingEvents: upcomingEvents.map((e) => ({
      id: e.id,
      title: e.title_en,
      startDate: e.startDate.toISOString(),
    })),
    contentSummary: [
      { label: "Services", published: publishedServices, total: services },
      { label: "Case Studies", published: publishedCaseStudies, total: caseStudies },
      { label: "Events", published: publishedEvents, total: events },
      { label: "Team Members", published: activeTeamMembers, total: teamMembers },
    ],
    systemOk: true,
  };
}
