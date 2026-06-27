import "server-only";
import * as XLSX from "xlsx";
import type { Lead, LeadStatus, GradeLevel, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { record } from "@/services/audit.service";
import { log } from "@/lib/logger";

export interface CreateLeadInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  grade?: GradeLevel | null;
  country?: string | null;
  source?: string | null;
  notes?: string | null;
  campaignData?: Record<string, string> | null;
}

export interface LeadMeta {
  ipAddress?: string | null;
  userAgent?: string | null;
}

/** Create a Lead and its initial "Lead created" activity. Returns the lead id. */
export async function createLead(
  input: CreateLeadInput,
  meta: LeadMeta = {},
): Promise<{ id: string }> {
  const lead = await prisma.lead.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone || null,
      grade: input.grade ?? null,
      country: input.country || null,
      source: input.source || "website",
      notes: input.notes || null,
      campaignData: (input.campaignData ?? undefined) as Prisma.InputJsonValue | undefined,
      activities: {
        create: {
          activityType: "created",
          description: "Lead created via website form.",
        },
      },
    },
  });

  log.lead("Lead created", { leadId: lead.id, source: lead.source });
  await record({
    action: "CREATE",
    entityType: "Lead",
    entityId: lead.id,
    details: `Lead ${input.firstName} ${input.lastName} (${input.email}) created.`,
    ipAddress: meta.ipAddress ?? null,
    userAgent: meta.userAgent ?? null,
  });

  return { id: lead.id };
}

export interface LeadFilters {
  status?: LeadStatus;
  assignedToId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listLeads(filters: LeadFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(200, Math.max(1, filters.pageSize ?? 25));

  const where: Prisma.LeadWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.assignedToId) where.assignedToId = filters.assignedToId;
  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: "insensitive" } },
      { lastName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { assignedTo: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  return { items, total, page, pageSize };
}

export async function getLead(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      activities: { orderBy: { createdAt: "desc" } },
    },
  });
}

export interface UpdateLeadStatusInput {
  id: string;
  status?: LeadStatus;
  assignedToId?: string | null;
  notes?: string;
}

export async function updateLeadStatus(input: UpdateLeadStatusInput, userId?: string | null) {
  const before = await prisma.lead.findUnique({ where: { id: input.id } });
  if (!before) throw new Error("Lead not found.");

  const data: Prisma.LeadUpdateInput = {};
  if (input.status !== undefined) data.status = input.status;
  if (input.assignedToId !== undefined) {
    data.assignedTo = input.assignedToId
      ? { connect: { id: input.assignedToId } }
      : { disconnect: true };
  }
  if (input.notes !== undefined) data.notes = input.notes;

  const updated = await prisma.lead.update({ where: { id: input.id }, data });

  const changes: string[] = [];
  if (input.status !== undefined && input.status !== before.status) {
    changes.push(`status ${before.status} → ${input.status}`);
    await prisma.leadActivity.create({
      data: {
        leadId: input.id,
        activityType: "status_change",
        description: `Status changed from ${before.status} to ${input.status}.`,
        createdBy: userId ?? null,
      },
    });
  }
  if (input.assignedToId !== undefined && input.assignedToId !== before.assignedToId) {
    changes.push("assignment changed");
    await prisma.leadActivity.create({
      data: {
        leadId: input.id,
        activityType: "assignment",
        description: input.assignedToId
          ? `Assigned to user ${input.assignedToId}.`
          : "Unassigned.",
        createdBy: userId ?? null,
      },
    });
  }

  log.lead("Lead updated", { leadId: input.id, changes });
  await record({
    userId,
    action: "UPDATE",
    entityType: "Lead",
    entityId: input.id,
    details: `Lead updated: ${changes.join(", ") || "fields updated"}.`,
  });

  return updated;
}

export async function addActivity(
  input: { leadId: string; activityType: string; description: string },
  userId?: string | null,
) {
  const activity = await prisma.leadActivity.create({
    data: {
      leadId: input.leadId,
      activityType: input.activityType,
      description: input.description,
      createdBy: userId ?? null,
    },
  });
  await record({
    userId,
    action: "UPDATE",
    entityType: "Lead",
    entityId: input.leadId,
    details: `Activity added: ${input.activityType}.`,
  });
  return activity;
}

function leadRows(leads: Lead[]) {
  return leads.map((l) => ({
    ID: l.id,
    "First Name": l.firstName,
    "Last Name": l.lastName,
    Email: l.email,
    Phone: l.phone ?? "",
    Grade: l.grade ?? "",
    Country: l.country ?? "",
    Source: l.source ?? "",
    Status: l.status,
    "Assigned To": l.assignedToId ?? "",
    Notes: l.notes ?? "",
    "Created At": l.createdAt.toISOString(),
  }));
}

/**
 * Export leads to CSV (string) or XLSX (Buffer). Both use the `xlsx` package.
 */
export async function exportLeads(format: "csv" | "xlsx"): Promise<string | Buffer> {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  const worksheet = XLSX.utils.json_to_sheet(leadRows(leads));

  if (format === "csv") {
    return XLSX.utils.sheet_to_csv(worksheet);
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
