import { requireCan } from "@/lib/admin-session";
import { listGradeOptionsRaw } from "@/services/grade.service";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { serializeRows } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  await requireCan("settings", "read");
  const grades = serializeRows(await listGradeOptionsRaw());
  return <SettingsManager grades={grades as never} />;
}
