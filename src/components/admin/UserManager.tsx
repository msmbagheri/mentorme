"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiClient, runMutation } from "@/lib/admin-client";
import { formatDate } from "@/lib/utils";
import { PageHeader, Field, SwitchRow } from "@/components/admin/shared";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface EditState {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
}

const ROLES = ["ADMIN", "EDITOR", "VIEWER"];
const ROLE_VARIANT: Record<string, "brand" | "info" | "neutral"> = {
  ADMIN: "brand",
  EDITOR: "info",
  VIEWER: "neutral",
};

function empty(): EditState {
  return { id: "", name: "", email: "", password: "", role: "EDITOR", isActive: true };
}

export function UserManager({ users }: { users: User[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<EditState | null>(null);

  const isNew = editing && !editing.id;

  async function save() {
    if (!editing) return;
    const res = await runMutation(
      () =>
        isNew
          ? apiClient.post("/api/admin/users", {
              name: editing.name,
              email: editing.email,
              password: editing.password,
              role: editing.role,
              isActive: editing.isActive,
            })
          : apiClient.patch("/api/admin/users", {
              id: editing.id,
              name: editing.name,
              email: editing.email,
              password: editing.password || "",
              role: editing.role,
              isActive: editing.isActive,
            }),
      { success: "User saved", error: "Could not save user" },
    );
    if (res) {
      setEditing(null);
      router.refresh();
    }
  }

  async function deactivate(id: string) {
    const res = await runMutation(() => apiClient.delete(`/api/admin/users?id=${id}`), {
      success: "User deactivated",
      error: "Could not deactivate",
    });
    if (res) router.refresh();
  }

  return (
    <div>
      <PageHeader title="Users" description="Manage admin accounts and roles.">
        <Button variant="cta" size="sm" onClick={() => setEditing(empty())}>
          <Plus className="size-4" /> New user
        </Button>
      </PageHeader>

      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-end">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-[var(--color-text-secondary)]">{u.email}</TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANT[u.role] ?? "neutral"}>{u.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.isActive ? "success" : "error"}>
                    {u.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-caption text-[var(--color-text-muted)]">
                  {formatDate(u.createdAt)}
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit user"
                      onClick={() =>
                        setEditing({
                          id: u.id,
                          name: u.name,
                          email: u.email,
                          password: "",
                          role: u.role,
                          isActive: u.isActive,
                        })
                      }
                    >
                      <Pencil className="size-4" />
                    </Button>
                    {u.isActive ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Deactivate user"
                        onClick={() => deactivate(u.id)}
                      >
                        <UserX className="size-4 text-[var(--color-error)]" />
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>{isNew ? "New user" : "Edit user"}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="flex flex-col gap-4">
              <Field label="Name" htmlFor="u-name" required>
                <Input id="u-name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </Field>
              <Field label="Email" htmlFor="u-email" required>
                <Input id="u-email" type="email" dir="ltr" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </Field>
              <Field
                label={isNew ? "Password" : "New password"}
                htmlFor="u-pass"
                required={!!isNew}
                hint={isNew ? "Min 8 characters" : "Leave blank to keep current password"}
              >
                <Input id="u-pass" type="password" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} />
              </Field>
              <Field label="Role" htmlFor="u-role">
                <Select id="u-role" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </Field>
              <SwitchRow
                label="Active"
                checked={editing.isActive}
                onCheckedChange={(v) => setEditing({ ...editing, isActive: v })}
              />
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button variant="cta" size="sm" onClick={save}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
