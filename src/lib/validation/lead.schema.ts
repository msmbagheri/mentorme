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

// E.164-ish phone; lenient to allow spaces, dashes, parentheses.
const phoneRegex = /^[+]?[\d\s().-]{7,20}$/;

export const leadCreateSchema = z.object({
  firstName: z.string().min(1, "First name is required.").max(80),
  lastName: z.string().min(1, "Last name is required.").max(80),
  email: z.string().email("A valid email is required."),
  phone: z
    .string()
    .regex(phoneRegex, "Enter a valid phone number.")
    .optional()
    .or(z.literal("")),
  grade: z.enum(GRADE_VALUES).optional(),
  country: z.string().max(80).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  source: z.string().max(80).optional(),
  campaignData: z.record(z.string()).optional(),
});

export const leadStatusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z
    .enum(["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"])
    .optional(),
  assignedToId: z.string().uuid().nullable().optional(),
  notes: z.string().max(2000).optional(),
});

export const leadActivitySchema = z.object({
  leadId: z.string().uuid(),
  activityType: z.string().min(1).max(60),
  description: z.string().min(1).max(2000),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
export type LeadStatusUpdateInput = z.infer<typeof leadStatusUpdateSchema>;
export type LeadActivityInput = z.infer<typeof leadActivitySchema>;
