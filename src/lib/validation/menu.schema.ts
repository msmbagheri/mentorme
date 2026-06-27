import { z } from "zod";

const MENU_ITEM_TYPE = ["SCROLL_TO_SECTION", "INTERNAL_PAGE", "EXTERNAL_URL"] as const;

export const menuCreateSchema = z.object({
  internalName: z
    .string()
    .min(1, "Internal name is required.")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens."),
});

export const menuItemCreateSchema = z.object({
  menuId: z.string().uuid(),
  label_en: z.string().min(1).max(120),
  label_fa: z.string().min(1).max(120),
  type: z.enum(MENU_ITEM_TYPE),
  internalUrl: z.string().max(300).optional().or(z.literal("")).nullable(),
  externalUrl: z.string().url().optional().or(z.literal("")).nullable(),
  sectionAnchor: z.string().max(120).optional().or(z.literal("")).nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const menuItemUpdateSchema = z.object({
  id: z.string().uuid(),
  label_en: z.string().min(1).max(120).optional(),
  label_fa: z.string().min(1).max(120).optional(),
  type: z.enum(MENU_ITEM_TYPE).optional(),
  internalUrl: z.string().max(300).optional().or(z.literal("")).nullable(),
  externalUrl: z.string().url().optional().or(z.literal("")).nullable(),
  sectionAnchor: z.string().max(120).optional().or(z.literal("")).nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export type MenuItemCreateInput = z.infer<typeof menuItemCreateSchema>;
export type MenuItemUpdateInput = z.infer<typeof menuItemUpdateSchema>;
