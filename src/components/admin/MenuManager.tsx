"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiClient, runMutation } from "@/lib/admin-client";
import { PageHeader, Field, ReadOnlyNotice } from "@/components/admin/shared";

interface MenuItem {
  id: string;
  menuId: string;
  label_en: string;
  label_fa: string;
  type: string;
  internalUrl: string | null;
  externalUrl: string | null;
  sectionAnchor: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface Menu {
  id: string;
  internalName: string;
  items: MenuItem[];
}

const TYPES = ["SCROLL_TO_SECTION", "INTERNAL_PAGE", "EXTERNAL_URL"];

function emptyItem(menuId: string, sortOrder: number): MenuItem {
  return {
    id: "",
    menuId,
    label_en: "",
    label_fa: "",
    type: "INTERNAL_PAGE",
    internalUrl: "",
    externalUrl: "",
    sectionAnchor: "",
    sortOrder,
    isActive: true,
  };
}

export function MenuManager({
  menus,
  canWrite,
  canDelete,
}: {
  menus: Menu[];
  canWrite: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<MenuItem | null>(null);

  async function saveItem() {
    if (!editing) return;
    const isNew = !editing.id;
    const body = {
      menuId: editing.menuId,
      label_en: editing.label_en,
      label_fa: editing.label_fa,
      type: editing.type,
      internalUrl: editing.internalUrl || null,
      externalUrl: editing.externalUrl || null,
      sectionAnchor: editing.sectionAnchor || null,
      sortOrder: editing.sortOrder,
      isActive: editing.isActive,
    };
    const res = await runMutation(
      () =>
        isNew
          ? apiClient.post("/api/admin/menu", body)
          : apiClient.patch("/api/admin/menu", { id: editing.id, ...body }),
      { success: "Menu item saved", error: "Could not save" },
    );
    if (res) {
      setEditing(null);
      router.refresh();
    }
  }

  async function removeItem(id: string) {
    const res = await runMutation(() => apiClient.delete(`/api/admin/menu?kind=item&id=${id}`), {
      success: "Item deleted",
      error: "Delete failed",
    });
    if (res) router.refresh();
  }

  async function reorder(item: MenuItem, dir: -1 | 1) {
    const res = await runMutation(
      () =>
        apiClient.patch("/api/admin/menu", {
          id: item.id,
          sortOrder: item.sortOrder + dir,
        }),
      { error: "Could not reorder" },
    );
    if (res) router.refresh();
  }

  return (
    <div>
      <PageHeader title="Menus" description="Header and footer navigation menus." />
      {!canWrite ? <ReadOnlyNotice className="mb-4" /> : null}

      <div className="flex flex-col gap-6">
        {menus.map((menu) => (
          <Card key={menu.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="capitalize">{menu.internalName}</CardTitle>
              {canWrite ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditing(emptyItem(menu.id, menu.items.length))}
                >
                  <Plus className="size-4" /> Add item
                </Button>
              ) : null}
            </CardHeader>
            <CardContent>
              {menu.items.length === 0 ? (
                <p className="py-4 text-small text-[var(--color-text-muted)]">No items yet.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-[var(--color-border)]">
                  {menu.items.map((item, idx) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--color-text-primary)]">
                          {item.label_en}{" "}
                          <span className="text-[var(--color-text-muted)]">/ {item.label_fa}</span>
                        </div>
                        <div className="flex items-center gap-2 text-caption text-[var(--color-text-muted)]">
                          <Badge variant="neutral">{item.type.replace(/_/g, " ")}</Badge>
                          {!item.isActive ? <Badge variant="error">Hidden</Badge> : null}
                        </div>
                      </div>
                      {canWrite ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Move up"
                            disabled={idx === 0}
                            onClick={() => reorder(item, -1)}
                          >
                            <ArrowUp className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Move down"
                            disabled={idx === menu.items.length - 1}
                            onClick={() => reorder(item, 1)}
                          >
                            <ArrowDown className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit" onClick={() => setEditing(item)}>
                            <Pencil className="size-4" />
                          </Button>
                          {canDelete ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label="Delete"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="size-4 text-[var(--color-error)]" />
                            </Button>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit item" : "New item"}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Label (EN)" htmlFor="mi-en" required>
                  <Input
                    id="mi-en"
                    value={editing.label_en}
                    onChange={(e) => setEditing({ ...editing, label_en: e.target.value })}
                  />
                </Field>
                <Field label="Label (FA)" htmlFor="mi-fa" required>
                  <Input
                    id="mi-fa"
                    dir="rtl"
                    value={editing.label_fa}
                    onChange={(e) => setEditing({ ...editing, label_fa: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Type" htmlFor="mi-type">
                <Select
                  id="mi-type"
                  value={editing.type}
                  onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </Field>
              {editing.type === "SCROLL_TO_SECTION" ? (
                <Field label="Section anchor" htmlFor="mi-anchor" hint="e.g. services">
                  <Input
                    id="mi-anchor"
                    dir="ltr"
                    value={editing.sectionAnchor ?? ""}
                    onChange={(e) => setEditing({ ...editing, sectionAnchor: e.target.value })}
                  />
                </Field>
              ) : editing.type === "EXTERNAL_URL" ? (
                <Field label="External URL" htmlFor="mi-ext">
                  <Input
                    id="mi-ext"
                    dir="ltr"
                    value={editing.externalUrl ?? ""}
                    onChange={(e) => setEditing({ ...editing, externalUrl: e.target.value })}
                  />
                </Field>
              ) : (
                <Field label="Internal URL" htmlFor="mi-int" hint="e.g. /services">
                  <Input
                    id="mi-int"
                    dir="ltr"
                    value={editing.internalUrl ?? ""}
                    onChange={(e) => setEditing({ ...editing, internalUrl: e.target.value })}
                  />
                </Field>
              )}
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button variant="cta" size="sm" onClick={saveItem}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
