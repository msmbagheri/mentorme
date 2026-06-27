import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listLeads, getLead } from "@/services/lead.service";
import { listUsers } from "@/services/user.service";
import { LeadTable } from "@/components/admin/LeadTable";
import { serializeRows, serializeRow } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function LeadsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; id?: string }>;
}) {
  const session = await requireCan("leads", "read");
  const sp = await searchParams;

  const validStatuses = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"];
  const status =
    sp.status && validStatuses.includes(sp.status)
      ? (sp.status as "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "CLOSED")
      : undefined;

  const [{ items, total }, users, selectedLead] = await Promise.all([
    listLeads({ status, search: sp.search, pageSize: 100 }),
    listUsers(),
    sp.id ? getLead(sp.id) : Promise.resolve(null),
  ]);

  return (
    <LeadTable
      leads={serializeRows(items) as never}
      total={total}
      users={users.map((u) => ({ id: u.id, name: u.name, email: u.email }))}
      initialLead={selectedLead ? (serializeRow(selectedLead) as never) : null}
      canWrite={can(session.role, "update", "leads")}
      filterStatus={status ?? ""}
      filterSearch={sp.search ?? ""}
    />
  );
}
