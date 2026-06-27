import "server-only";
import type { GradeLevel, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Admin raw list of grade options (all, ordered for management). */
export async function listGradeOptionsRaw() {
  return prisma.gradeOption.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getGradeOption(id: string) {
  return prisma.gradeOption.findUnique({ where: { id } });
}

export interface GradeOptionInput {
  grade: GradeLevel;
  label_en: string;
  label_fa: string;
  ctaLabel_en?: string | null;
  ctaLabel_fa?: string | null;
  funnelMode?: string | null;
  leadSource?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export async function createGradeOption(input: GradeOptionInput) {
  return prisma.gradeOption.create({
    data: {
      grade: input.grade,
      label_en: input.label_en,
      label_fa: input.label_fa,
      ctaLabel_en: input.ctaLabel_en ?? null,
      ctaLabel_fa: input.ctaLabel_fa ?? null,
      funnelMode: input.funnelMode ?? null,
      leadSource: input.leadSource ?? null,
      sortOrder: input.sortOrder ?? 0,
      isActive: input.isActive ?? true,
    },
  });
}

export async function updateGradeOption(
  id: string,
  input: Partial<Omit<GradeOptionInput, "grade">>,
) {
  const data: Prisma.GradeOptionUpdateInput = {};
  if (input.label_en !== undefined) data.label_en = input.label_en;
  if (input.label_fa !== undefined) data.label_fa = input.label_fa;
  if (input.ctaLabel_en !== undefined) data.ctaLabel_en = input.ctaLabel_en;
  if (input.ctaLabel_fa !== undefined) data.ctaLabel_fa = input.ctaLabel_fa;
  if (input.funnelMode !== undefined) data.funnelMode = input.funnelMode;
  if (input.leadSource !== undefined) data.leadSource = input.leadSource;
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  return prisma.gradeOption.update({ where: { id }, data });
}

export async function deleteGradeOption(id: string) {
  return prisma.gradeOption.delete({ where: { id } });
}
