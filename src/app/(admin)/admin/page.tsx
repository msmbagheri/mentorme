import { requireSession } from "@/lib/admin-session";
import { getDashboardStats } from "@/services/dashboard.service";
import { DashboardCards } from "@/components/admin/DashboardCards";
import { PageHeader } from "@/components/admin/shared";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireSession();
  const stats = await getDashboardStats();

  return (
    <div>
      <PageHeader
        title={`Welcome back${session.name ? `, ${session.name.split(" ")[0]}` : ""}`}
        description="Overview of leads, events, and content across MentorMe."
      />
      <DashboardCards data={stats} />
    </div>
  );
}
