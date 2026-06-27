import { z } from "zod";

const MEDIA_TYPE = ["IMAGE", "VIDEO", "DOCUMENT"] as const;

/** Validates the form fields that accompany a multipart upload (not the file). */
export const mediaUploadMetaSchema = z.object({
  altText_en: z.string().max(300).optional().or(z.literal("")).nullable(),
  altText_fa: z.string().max(300).optional().or(z.literal("")).nullable(),
});

export const mediaUpdateSchema = z.object({
  id: z.string().uuid(),
  altText_en: z.string().max(300).optional().or(z.literal("")).nullable(),
  altText_fa: z.string().max(300).optional().or(z.literal("")).nullable(),
});

export const mediaFilterSchema = z.object({
  mediaType: z.enum(MEDIA_TYPE).optional(),
  search: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export type MediaUploadMetaInput = z.infer<typeof mediaUploadMetaSchema>;
export type MediaUpdateInput = z.infer<typeof mediaUpdateSchema>;
