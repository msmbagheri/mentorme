import { z } from "zod";

const GRADE_VALUES = [
  "GRADE_6",
  "GRADE_7",
  "GRADE_8",
  "GRADE_9",
  "GRADE_10",
  "GRADE_11",
  "GRADE_12",
  "TRANSFER",
] as const;

const optShort = z.string().max(160).optional().or(z.literal("")).nullable();

export const gradeCreateSchema = z.object({
  grade: z.enum(GRADE_VALUES),
  label_en: z.string().min(1).max(120),
  label_fa: z.string().min(1).max(120),
  ctaLabel_en: optShort,
  ctaLabel_fa: optShort,
  funnelMode: optShort,
  leadSource: optShort,
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const gradeUpdateSchema = z.object({
  id: z.string().uuid(),
  label_en: z.string().min(1).max(120).optional(),
  label_fa: z.string().min(1).max(120).optional(),
  ctaLabel_en: optShort,
  ctaLabel_fa: optShort,
  funnelMode: optShort,
  leadSource: optShort,
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export type GradeCreateInput = z.infer<typeof gradeCreateSchema>;
export type GradeUpdateInput = z.infer<typeof gradeUpdateSchema>;
