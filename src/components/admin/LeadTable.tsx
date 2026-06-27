"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { PageHeader, LeadStatusBadge, EmptyState } from "@/components/admin/shared";
import { LeadDetail, type LeadRecord } from "@/components/admin/LeadDetail";

interface LeadRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  grade: string | null;
  country: string | null;
  source: string | null;
  status: string;
  createdAt: string;
  assignedTo?: { id: string; name: string | null } | null;
}

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"];
const GRADES = [
  "GRADE_6",
  "GRADE_7",
  "GRADE_8",
  "GRADE_9",
  "GRADE_10",
  "GRADE_11",
  "GRADE_12",
  "TRANSFER",
];

export function LeadTable({
  leads,
  total,
  users,
  initialLead,
  canWrite,
  filterStatus,
  filterSearch,
}: {
  leads: LeadRow[];
  total: number;
  users: { id: string; name: string | null; email: string }[];
  initialLead: LeadRecord | null;
  canWrite: boolean;
  filterStatus: string;
  filterSearch: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = React.useState(filterSearch);
  const [gradeFilter, setGradeFilter] = React.useState("");
  const [sourceFilter, setSourceFilter] = React.useState("");
  const [detail, setDetail] = React.useState<LeadRecord | null>(initialLead);

  React.useEffect(() => {
    setDetail(initialLead);
  }, [initialLead]);

  function applyParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("id");
    router.push(`/admin/leads?${next.toString()}`);
  }

  const sources = React.useMemo(
    () => Array.from(new Set(leads.map((l) => l.source).filter(Boolean))) as string[],
    [leads],
  );

  const visible = leads.filter(
    (l) =>
      (!gradeFilter || l.grade === gradeFilter) &&
      (!sourceFilter || l.source === sourceFilter),
  );

  function openLead(id: string) {
    const next = new URLSearchParams(params.toString());
    next.set("id", id);
    router.push(`/admin/leads?${next.toString()}`);
  }

  return (
    <div>
      <PageHeader title="Leads" description={`${total} total leads in the pipeline.`}>
        <Button asChild variant="secondary" size="sm">
          <a href="/api/admin/leads?export=csv" download>
            <Download className="size-4" /> CSV
          </a>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <a href="/api/admin/leads?export=xlsx" download>
            <Download className="size-4" /> Excel
          </a>
        </Button>
      </PageHeader>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute inset-inline-start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)] start-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyParam("search", search)}
            placeholder="Search name or email…"
            className="ps-9"
            aria-label="Search leads"
          />
        </div>
        <Select
          value={filterStatus}
          onChange={(e) => applyParam("status", e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          aria-label="Filter by grade"
        >
          <option value="">All grades</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {g.replace("_", " ")}
            </option>
          ))}
        </Select>
        <Select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          aria-label="Filter by source"
        >
          <option value="">All sources</option>
          {sources.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No leads match your filters" />
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-end">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    {lead.firstName} {lead.lastName}
                  </TableCell>
                  <TableCell className="text-[var(--color-text-secondary)]">
                    {lead.email}
                  </TableCell>
                  <TableCell>{lead.grade ? lead.grade.replace("_", " ") : "—"}</TableCell>
                  <TableCell>{lead.source ?? "—"}</TableCell>
                  <TableCell>
                    <LeadStatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell>{lead.assignedTo?.name ?? "Unassigned"}</TableCell>
                  <TableCell className="text-caption text-[var(--color-text-muted)]">
                    {formatDate(lead.createdAt)}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open lead"
                      onClick={() => openLead(lead.id)}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <LeadDetail
        lead={detail}
        users={users}
        canWrite={canWrite}
        onClose={() => {
          const next = new URLSearchParams(params.toString());
          next.delete("id");
          router.push(`/admin/leads?${next.toString()}`);
        }}
      />
    </div>
  );
}
