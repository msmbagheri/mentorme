"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { PageHeader, Field, SwitchRow } from "@/components/admin/shared";

interface Grade {
  id: string;
  grade: string;
  label_en: string;
  label_fa: string;
  ctaLabel_en: string | null;
  ctaLabel_fa: string | null;
  funnelMode: string | null;
  leadSource: string | null;
  sortOrder: number;
  isActive: boolean;
}

const GRADE_VALUES = [
  "GRADE_6",
  "GRADE_7",
  "GRADE_8",
  "GRADE_9",
  "GRADE_10",
  "GRADE_11",
  "GRADE_12",
  "TRANSFER",
];

const FUNNEL_MODES = ["awareness", "foundation", "strategy", "urgency", "transfer"];

function empty(order: number): Grade {
  return {
    id: "",
    grade: "GRADE_6",
    label_en: "",
    label_fa: "",
    ctaLabel_en: "",
    ctaLabel_fa: "",
    funnelMode: "awareness",
    leadSource: "",
    sortOrder: order,
    isActive: true,
  };
}

export function SettingsManager({ grades }: { grades: Grade[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<Grade | null>(null);

  const isNew = editing && !editing.id;
  const usedGrades = new Set(grades.map((g) => g.grade));

  async function save() {
    if (!editing) return;
    const base = {
      label_en: editing.label_en,
      label_fa: editing.label_fa,
      ctaLabel_en: editing.ctaLabel_en || null,
      ctaLabel_fa: editing.ctaLabel_fa || null,
      funnelMode: editing.funnelMode || null,
      leadSource: editing.leadSource || null,
      sortOrder: editing.sortOrder,
      isActive: editing.isActive,
    };
    const res = await runMutation(
      () =>
        isNew
          ? apiClient.post("/api/admin/grades", { grade: editing.grade, ...base })
          : apiClient.patch("/api/admin/grades", { id: editing.id, ...base }),
      { success: "Grade saved", error: "Could not save grade" },
    );
    if (res) {
      setEditing(null);
      router.refresh();
    }
  }

  async function toggle(g: Grade, isActive: boolean) {
    const res = await runMutation(
      () => apiClient.patch("/api/admin/grades", { id: g.id, isActive }),
      { error: "Could not update grade" },
    );
    if (res) router.refresh();
  }

  async function reorder(g: Grade, dir: -1 | 1) {
    const res = await runMutation(
      () => apiClient.patch("/api/admin/grades", { id: g.id, sortOrder: g.sortOrder + dir }),
      { error: "Could not reorder" },
    );
    if (res) router.refresh();
  }

  async function remove(id: string) {
    const res = await runMutation(() => apiClient.delete(`/api/admin/grades?id=${id}`), {
      success: "Grade deleted",
      error: "Delete failed",
    });
    if (res) router.refresh();
  }

  return (
    <div>
      <PageHeader title="Settings" description="Global configuration and grade funnel options." />

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-h4">Grade options</CardTitle>
            <CardDescription>
              Grades shown in the hero selector. Each sets the lead funnel routing.
            </CardDescription>
          </div>
          <Button
            variant="cta"
            size="sm"
            onClick={() => setEditing(empty(grades.length))}
            disabled={usedGrades.size >= GRADE_VALUES.length}
          >
            <Plus className="size-4" /> Add grade
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Label (EN)</TableHead>
                <TableHead>Funnel</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((g, idx) => (
                <TableRow key={g.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="Move up"
                        disabled={idx === 0}
                        onClick={() => reorder(g, -1)}
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="Move down"
                        disabled={idx === grades.length - 1}
                        onClick={() => reorder(g, 1)}
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-caption">
                    {g.grade.replace("_", " ")}
                  </TableCell>
                  <TableCell className="font-medium">{g.label_en}</TableCell>
                  <TableCell>
                    {g.funnelMode ? <Badge variant="info">{g.funnelMode}</Badge> : "—"}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={g.isActive}
                      onCheckedChange={(v) => toggle(g, v)}
                      aria-label="Toggle active"
                    />
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditing(g)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove(g.id)}>
                        <Trash2 className="size-4 text-[var(--color-error)]" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{isNew ? "New grade option" : "Edit grade option"}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="flex flex-col gap-4">
              {isNew ? (
                <Field label="Grade" htmlFor="g-grade">
                  <Select
                    id="g-grade"
                    value={editing.grade}
                    onChange={(e) => setEditing({ ...editing, grade: e.target.value })}
                  >
                    {GRADE_VALUES.filter((v) => !usedGrades.has(v)).map((v) => (
                      <option key={v} value={v}>
                        {v.replace("_", " ")}
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Label (EN)" htmlFor="g-en" required>
                  <Input id="g-en" value={editing.label_en} onChange={(e) => setEditing({ ...editing, label_en: e.target.value })} />
                </Field>
                <Field label="Label (FA)" htmlFor="g-fa" required>
                  <Input id="g-fa" dir="rtl" value={editing.label_fa} onChange={(e) => setEditing({ ...editing, label_fa: e.target.value })} />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="CTA label (EN)" htmlFor="g-cta-en">
                  <Input id="g-cta-en" value={editing.ctaLabel_en ?? ""} onChange={(e) => setEditing({ ...editing, ctaLabel_en: e.target.value })} />
                </Field>
                <Field label="CTA label (FA)" htmlFor="g-cta-fa">
                  <Input id="g-cta-fa" dir="rtl" value={editing.ctaLabel_fa ?? ""} onChange={(e) => setEditing({ ...editing, ctaLabel_fa: e.target.value })} />
                </Field>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Funnel mode" htmlFor="g-funnel">
                  <Select
                    id="g-funnel"
                    value={editing.funnelMode ?? ""}
                    onChange={(e) => setEditing({ ...editing, funnelMode: e.target.value })}
                  >
                    <option value="">— None —</option>
                    {FUNNEL_MODES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Lead source" htmlFor="g-source">
                  <Input id="g-source" dir="ltr" value={editing.leadSource ?? ""} onChange={(e) => setEditing({ ...editing, leadSource: e.target.value })} />
                </Field>
              </div>
              <SwitchRow
                label="Active"
                description="Inactive grades are hidden from the hero selector."
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
