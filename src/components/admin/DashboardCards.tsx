import Link from "next/link";
import {
  Inbox,
  Calendar,
  FileText,
  Users,
  Plus,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeadStatusBadge } from "@/components/admin/shared";
import { formatDate } from "@/lib/utils";

export interface DashboardData {
  leadCounts: { status: string; count: number }[];
  totalLeads: number;
  recentLeads: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    createdAt: string;
  }[];
  upcomingEvents: { id: string; title: string; startDate: string }[];
  contentSummary: { label: string; published: number; total: number }[];
  systemOk: boolean;
}

const LEAD_ORDER = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"];

function Kpi({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="transition-shadow hover:shadow-[var(--shadow-md)]">
        <CardContent className="flex items-center gap-4 p-5">
          <span className="flex size-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] text-[var(--brand-primary)]">
            <Icon className="size-5" aria-hidden />
          </span>
          <div>
            <div className="text-h3 font-bold text-[var(--color-text-primary)]">{value}</div>
            <div className="text-small text-[var(--color-text-secondary)]">{label}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function DashboardCards({ data }: { data: DashboardData }) {
  const countFor = (status: string) =>
    data.leadCounts.find((c) => c.status === status)?.count ?? 0;
  const totalContentPublished = data.contentSummary.reduce((s, c) => s + c.published, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Inbox} label="Total leads" value={data.totalLeads} href="/admin/leads" />
        <Kpi
          icon={CheckCircle2}
          label="Converted leads"
          value={countFor("CONVERTED")}
          href="/admin/leads"
        />
        <Kpi
          icon={Calendar}
          label="Upcoming events"
          value={data.upcomingEvents.length}
          href="/admin/events"
        />
        <Kpi
          icon={FileText}
          label="Published content"
          value={totalContentPublished}
          href="/admin/services"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lead status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h4">Lead pipeline</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {LEAD_ORDER.map((status) => {
              const count = countFor(status);
              const pct = data.totalLeads ? Math.round((count / data.totalLeads) * 100) : 0;
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-small">
                    <LeadStatusBadge status={status} />
                    <span className="font-semibold text-[var(--color-text-primary)]">
                      {count}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-alt)]">
                    <div
                      className="h-full rounded-full bg-gradient-cta"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent leads */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-h4">Recent leads</CardTitle>
            <Link
              href="/admin/leads"
              className="text-small font-semibold text-[var(--brand-primary)] hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentLeads.length === 0 ? (
              <p className="py-6 text-center text-small text-[var(--color-text-muted)]">
                No leads yet.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[var(--color-border)]">
                {data.recentLeads.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      href={`/admin/leads?id=${lead.id}`}
                      className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-[var(--color-surface-alt)]"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-[var(--color-text-primary)]">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="truncate text-caption text-[var(--color-text-muted)]">
                          {lead.email}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <LeadStatusBadge status={lead.status} />
                        <span className="hidden text-caption text-[var(--color-text-muted)] sm:inline">
                          {formatDate(lead.createdAt)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h4">Upcoming events</CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingEvents.length === 0 ? (
              <p className="py-4 text-center text-small text-[var(--color-text-muted)]">
                No upcoming events.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {data.upcomingEvents.map((ev) => (
                  <li key={ev.id} className="flex items-start gap-3">
                    <Calendar
                      className="mt-0.5 size-4 shrink-0 text-[var(--brand-primary)]"
                      aria-hidden
                    />
                    <div>
                      <div className="text-small font-semibold text-[var(--color-text-primary)]">
                        {ev.title}
                      </div>
                      <div className="text-caption text-[var(--color-text-muted)]">
                        {formatDate(ev.startDate)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Content summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h4">Content summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2.5">
              {data.contentSummary.map((c) => (
                <li key={c.label} className="flex items-center justify-between text-small">
                  <span className="text-[var(--color-text-secondary)]">{c.label}</span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {c.published}
                    <span className="text-[var(--color-text-muted)]"> / {c.total}</span>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* System status + quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-h4">System & actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={data.systemOk ? "success" : "error"}>
                {data.systemOk ? "All systems operational" : "Degraded"}
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href="/admin/services"
                className="flex items-center gap-2 text-small font-semibold text-[var(--brand-primary)] hover:underline"
              >
                <Plus className="size-4" aria-hidden /> New service
              </Link>
              <Link
                href="/admin/events"
                className="flex items-center gap-2 text-small font-semibold text-[var(--brand-primary)] hover:underline"
              >
                <Plus className="size-4" aria-hidden /> New event
              </Link>
              <Link
                href="/admin/media"
                className="flex items-center gap-2 text-small font-semibold text-[var(--brand-primary)] hover:underline"
              >
                <Users className="size-4" aria-hidden /> Manage media
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
