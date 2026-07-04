import { z } from "zod";

const optUrl = z.string().max(500).optional().or(z.literal("")).nullable();
const optColor = z
  .string()
  .max(40)
  .optional()
  .or(z.literal(""))
  .nullable();

export const themeUpdateSchema = z.object({
  brandName: z.string().min(1, "Brand name is required.").max(120),
  tagline_en: z.string().min(1).max(200),
  tagline_fa: z.string().min(1).max(200),
  primaryLogoUrl: optUrl,
  darkLogoUrl: optUrl,
  mobileLogoUrl: optUrl,
  faviconUrl: optUrl,
  primaryColor: optColor,
  accentColor: optColor,
  ctaGradientStart: optColor,
  ctaGradientEnd: optColor,
  fontFamilyLatin: z.string().max(120).optional().or(z.literal("")).nullable(),
  fontFamilyPersian: z.string().max(120).optional().or(z.literal("")).nullable(),
  fontUrlLatin: optUrl,
  fontUrlPersian: optUrl,
  buttonSize: z.enum(["sm", "md", "lg"]).optional().or(z.literal("")).nullable(),
  socialLinks: z
    .array(z.object({ platform: z.string().min(1).max(60), url: z.string().url() }))
    .optional(),
  contactInformation: z
    .object({
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().max(60).optional().or(z.literal("")),
      address: z.string().max(400).optional().or(z.literal("")),
      hours: z.string().max(200).optional().or(z.literal("")),
    })
    .optional(),
});

export type ThemeUpdateInput = z.infer<typeof themeUpdateSchema>;
