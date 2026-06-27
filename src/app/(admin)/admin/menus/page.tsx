import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { listMenus } from "@/services/menu.service";
import { MenuManager } from "@/components/admin/MenuManager";
import { serializeRows } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function MenusAdminPage() {
  const session = await requireCan("menus", "read");
  const menus = serializeRows(await listMenus());
  return (
    <MenuManager
      menus={menus}
      canWrite={can(session.role, "update", "menus")}
      canDelete={can(session.role, "delete", "menus")}
    />
  );
}
