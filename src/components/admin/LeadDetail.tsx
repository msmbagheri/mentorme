"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, MapPin, GraduationCap, Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient, runMutation } from "@/lib/admin-client";
import { formatDate, formatTime } from "@/lib/utils";
import { Field, LeadStatusBadge } from "@/components/admin/shared";

export interface LeadActivityRecord {
  id: string;
  activityType: string;
  description: string;
  createdAt: string;
}

export interface LeadRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  grade: string | null;
  country: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  assignedToId: string | null;
  createdAt: string;
  activities?: LeadActivityRecord[];
}

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"];

export function LeadDetail({
  lead,
  users,
  canWrite,
  onClose,
}: {
  lead: LeadRecord | null;
  users: { id: string; name: string | null; email: string }[];
  canWrite: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [status, setStatus] = React.useState("");
  const [assignee, setAssignee] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setAssignee(lead.assignedToId ?? "");
      setNotes(lead.notes ?? "");
    }
  }, [lead]);

  if (!lead) return null;

  async function save() {
    if (!lead) return;
    setSaving(true);
    const res = await runMutation(
      () =>
        apiClient.patch("/api/admin/leads", {
          id: lead.id,
          status,
          assignedToId: assignee || null,
          notes,
        }),
      { success: "Lead updated", error: "Could not update lead" },
    );
    setSaving(false);
    if (res) {
      router.refresh();
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent size="lg" className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {lead.firstName} {lead.lastName}
            <LeadStatusBadge status={lead.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contact + edit */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 text-small">
              <InfoRow icon={Mail} label="Email" value={lead.email} />
              <InfoRow icon={Phone} label="Phone" value={lead.phone ?? "—"} />
              <InfoRow
                icon={GraduationCap}
                label="Grade"
                value={lead.grade ? lead.grade.replace("_", " ") : "—"}
              />
              <InfoRow icon={MapPin} label="Country" value={lead.country ?? "—"} />
              <InfoRow icon={Clock} label="Source" value={lead.source ?? "—"} />
              <InfoRow
                icon={Clock}
                label="Created"
                value={formatDate(lead.createdAt)}
              />
            </div>

            <Field label="Status" htmlFor="lead-status">
              <Select
                id="lead-status"
                value={status}
                disabled={!canWrite}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Assignee" htmlFor="lead-assignee">
              <Select
                id="lead-assignee"
                value={assignee}
                disabled={!canWrite}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name ?? u.email}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Notes" htmlFor="lead-notes">
              <Textarea
                id="lead-notes"
                value={notes}
                disabled={!canWrite}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </Field>

            {canWrite ? (
              <Button variant="cta" size="sm" onClick={save} disabled={saving}>
                <Save className="size-4" /> Save changes
              </Button>
            ) : null}
          </div>

          {/* Activity timeline */}
          <div>
            <h3 className="mb-3 text-small font-semibold text-[var(--color-text-primary)]">
              Activity timeline
            </h3>
            <ol className="relative flex flex-col gap-4 border-s border-[var(--color-border)] ps-5">
              {(lead.activities ?? []).map((a) => (
                <li key={a.id} className="relative">
                  <span
                    className="absolute -inset-inline-start-[1.65rem] top-1 size-2.5 rounded-full bg-[var(--brand-primary)] start-[-1.65rem]"
                    aria-hidden
                  />
                  <div className="text-small font-medium capitalize text-[var(--color-text-primary)]">
                    {a.activityType.replace(/_/g, " ")}
                  </div>
                  <div className="text-caption text-[var(--color-text-secondary)]">
                    {a.description}
                  </div>
                  <div className="text-caption text-[var(--color-text-muted)]">
                    {formatDate(a.createdAt)} · {formatTime(a.createdAt)}
                  </div>
                </li>
              ))}
              {(lead.activities ?? []).length === 0 ? (
                <li className="text-caption text-[var(--color-text-muted)]">No activity yet.</li>
              ) : null}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
      <span className="text-[var(--color-text-muted)]">{label}:</span>
      <span className="font-medium text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}
