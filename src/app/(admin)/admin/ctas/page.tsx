import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listCtas } from "@/services/cta.service";
import { CtaManager } from "@/components/admin/CtaManager";
import { serializeRows } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function CtasAdminPage() {
  const session = await requireCan("ctas", "read");
  const ctas = serializeRows(await listCtas());
  return (
    <CtaManager
      ctas={ctas}
      canWrite={can(session.role, "update", "ctas")}
      canDelete={can(session.role, "delete", "ctas")}
    />
  );
}
