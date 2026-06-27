import { z } from "zod";

const CTA_ACTION_TYPE = [
  "OPEN_LEAD_FORM",
  "OPEN_CONTACT_PAGE",
  "OPEN_CALENDLY",
  "OPEN_CALCOM",
  "INTERNAL_URL",
  "EXTERNAL_URL",
  "DOWNLOAD_ASSET",
] as const;

const optUrl = z.string().max(500).optional().or(z.literal("")).nullable();

export const ctaCreateSchema = z.object({
  internalName: z
    .string()
    .min(1, "Internal name is required.")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens."),
  label_en: z.string().min(1).max(120),
  label_fa: z.string().min(1).max(120),
  actionType: z.enum(CTA_ACTION_TYPE),
  internalUrl: optUrl,
  externalUrl: optUrl,
  calendlyUrl: optUrl,
  calcomUrl: optUrl,
  assetUrl: optUrl,
  isActive: z.boolean().default(true),
});

export const ctaUpdateSchema = z.object({
  id: z.string().uuid(),
  internalName: z.string().min(1).max(80).optional(),
  label_en: z.string().min(1).max(120).optional(),
  label_fa: z.string().min(1).max(120).optional(),
  actionType: z.enum(CTA_ACTION_TYPE).optional(),
  internalUrl: optUrl,
  externalUrl: optUrl,
  calendlyUrl: optUrl,
  calcomUrl: optUrl,
  assetUrl: optUrl,
  isActive: z.boolean().optional(),
});

export type CtaCreateInput = z.infer<typeof ctaCreateSchema>;
export type CtaUpdateInput = z.infer<typeof ctaUpdateSchema>;
