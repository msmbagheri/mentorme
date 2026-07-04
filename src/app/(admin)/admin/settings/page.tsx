import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listGradeOptionsRaw } from "@/services/grade.service";
import { getLeadFieldSettings } from "@/services/lead-fields.service";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { LeadFieldsManager } from "@/components/admin/LeadFieldsManager";
import { serializeRows } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  const session = await requireCan("settings", "read");
  const [grades, leadFields] = await Promise.all([
    listGradeOptionsRaw().then((rows) => serializeRows(rows)),
    getLeadFieldSettings(),
  ]);
  return (
    <>
      <SettingsManager grades={grades as never} />
      <LeadFieldsManager
        fields={leadFields}
        canWrite={can(session.role, "update", "settings")}
      />
    </>
  );
}
