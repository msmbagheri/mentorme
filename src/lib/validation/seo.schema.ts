import { z } from "zod";

const optStr = z.string().max(2000).optional().or(z.literal("")).nullable();
const optShort = z.string().max(300).optional().or(z.literal("")).nullable();
// Accept a full URL or an uploaded-media path the app serves (/uploads/… or
// /api/media/file/…) — OG image references are relative; not an arbitrary string.
const optUrl = z
  .string()
  .max(500)
  .refine(
    (v) => v === "" || /^https?:\/\//i.test(v) || /^\/(uploads|api\/media\/file)\//.test(v),
    "Enter a full URL or pick an uploaded file.",
  )
  .optional()
  .or(z.literal(""))
  .nullable();

export const seoUpsertSchema = z.object({
  pageId: z.string().uuid(),
  metaTitle_en: optShort,
  metaTitle_fa: optShort,
  metaDescription_en: optStr,
  metaDescription_fa: optStr,
  canonicalUrl: optUrl,
  ogImageUrl: optUrl,
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
  structuredData: z.record(z.unknown()).optional().nullable(),
});

export type SeoUpsertInput = z.infer<typeof seoUpsertSchema>;
