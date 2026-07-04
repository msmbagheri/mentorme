import "server-only";
import { prisma } from "@/lib/db";

/** Optional lead-form fields whose shown/required flags admins can configure. */
export const CONFIGURABLE_LEAD_FIELDS = ["phone", "country", "notes"] as const;
export type ConfigurableLeadField = (typeof CONFIGURABLE_LEAD_FIELDS)[number];

export interface LeadFieldSettingDTO {
  field: ConfigurableLeadField;
  isShown: boolean;
  isRequired: boolean;
}

const DEFAULTS: Record<ConfigurableLeadField, { isShown: boolean; isRequired: boolean }> = {
  phone: { isShown: true, isRequired: false },
  country: { isShown: true, isRequired: false },
  notes: { isShown: true, isRequired: false },
};

export function isConfigurableLeadField(v: string): v is ConfigurableLeadField {
  return (CONFIGURABLE_LEAD_FIELDS as readonly string[]).includes(v);
}

/**
 * Resolve the configurable lead fields, merging stored rows over the defaults so
 * the result is always complete (one entry per CONFIGURABLE_LEAD_FIELDS).
 */
export async function getLeadFieldSettings(): Promise<LeadFieldSettingDTO[]> {
  const rows = await prisma.leadFieldSetting.findMany();
  const byField = new Map(rows.map((r) => [r.field, r]));
  return CONFIGURABLE_LEAD_FIELDS.map((field, i) => {
    const row = byField.get(field);
    return {
      field,
      isShown: row?.isShown ?? DEFAULTS[field].isShown,
      isRequired: row?.isRequired ?? DEFAULTS[field].isRequired,
      sortOrder: row?.sortOrder ?? i,
    };
  }).map(({ field, isShown, isRequired }) => ({ field, isShown, isRequired }));
}

export async function updateLeadFieldSetting(
  field: string,
  input: { isShown: boolean; isRequired: boolean },
) {
  if (!isConfigurableLeadField(field)) throw new Error("Unknown lead field.");
  const sortOrder = CONFIGURABLE_LEAD_FIELDS.indexOf(field);
  return prisma.leadFieldSetting.upsert({
    where: { field },
    update: { isShown: input.isShown, isRequired: input.isRequired },
    create: { field, isShown: input.isShown, isRequired: input.isRequired, sortOrder },
  });
}
