import { requireCan } from "@/lib/admin-session";
import { listUsers } from "@/services/user.service";
import { UserManager } from "@/components/admin/UserManager";
import { serializeRows } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export default async function UsersAdminPage() {
  await requireCan("users", "read");
  const users = serializeRows(await listUsers());
  return <UserManager users={users as never} />;
}
