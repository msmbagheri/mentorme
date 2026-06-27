import "server-only";
import type { ThemeSetting, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { pick } from "@/lib/i18n";
import { toMenuItemDTO } from "@/services/menu.service";
import type { AppLocale } from "@/types/locale";
import type {
  ThemeDTO,
  SocialLink,
  ContactInfo,
  FooterDTO,
} from "@/types/cms";

/** Design-system fallbacks used when no ThemeSetting row exists yet. */
const THEME_DEFAULTS = {
  brandName: "MentorMe",
  tagline: { en: "Your path to global universities", fa: "مسیر شما به دانشگاه‌های جهانی" },
  primaryColor: "#1e3a8a",
  accentColor: "#f59e0b",
  ctaGradientStart: "#2563eb",
  ctaGradientEnd: "#7c3aed",
};

function parseSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (v): v is SocialLink =>
        !!v &&
        typeof v === "object" &&
        typeof (v as Record<string, unknown>).platform === "string" &&
        typeof (v as Record<string, unknown>).url === "string",
    )
    .map((v) => ({ platform: v.platform, url: v.url }));
}

function parseContact(value: unknown): ContactInfo {
  if (!value || typeof value !== "object") return {};
  const v = value as Record<string, unknown>;
  const out: ContactInfo = {};
  if (typeof v.email === "string") out.email = v.email;
  if (typeof v.phone === "string") out.phone = v.phone;
  if (typeof v.address === "string") out.address = v.address;
  if (typeof v.hours === "string") out.hours = v.hours;
  return out;
}

export function toThemeDTO(theme: ThemeSetting | null, locale: AppLocale): ThemeDTO {
  if (!theme) {
    return {
      brandName: THEME_DEFAULTS.brandName,
      tagline: THEME_DEFAULTS.tagline[locale],
      primaryLogoUrl: null,
      darkLogoUrl: null,
      mobileLogoUrl: null,
      faviconUrl: null,
      primaryColor: THEME_DEFAULTS.primaryColor,
      accentColor: THEME_DEFAULTS.accentColor,
      ctaGradientStart: THEME_DEFAULTS.ctaGradientStart,
      ctaGradientEnd: THEME_DEFAULTS.ctaGradientEnd,
      socialLinks: [],
      contact: {},
    };
  }

  return {
    brandName: theme.brandName,
    tagline: pick(theme, "tagline", locale),
    primaryLogoUrl: theme.primaryLogoUrl,
    darkLogoUrl: theme.darkLogoUrl,
    mobileLogoUrl: theme.mobileLogoUrl,
    faviconUrl: theme.faviconUrl,
    primaryColor: theme.primaryColor ?? THEME_DEFAULTS.primaryColor,
    accentColor: theme.accentColor ?? THEME_DEFAULTS.accentColor,
    ctaGradientStart: theme.ctaGradientStart ?? THEME_DEFAULTS.ctaGradientStart,
    ctaGradientEnd: theme.ctaGradientEnd ?? THEME_DEFAULTS.ctaGradientEnd,
    socialLinks: parseSocialLinks(theme.socialLinks),
    contact: parseContact(theme.contactInformation),
  };
}

/** Public, localized theme. There is a single global ThemeSetting row. */
export async function getTheme(locale: AppLocale): Promise<ThemeDTO> {
  const theme = await prisma.themeSetting.findFirst({ orderBy: { createdAt: "asc" } });
  return toThemeDTO(theme, locale);
}

/**
 * Public, localized footer. Assembles the FooterSetting row, its linked footer
 * menu, and a list of published services for the "Services" column.
 */
export async function getFooter(locale: AppLocale): Promise<FooterDTO> {
  const setting = await prisma.footerSetting.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  let navItems: FooterDTO["navItems"] = [];
  if (setting?.footerMenuId) {
    const menu = await prisma.menu.findUnique({
      where: { id: setting.footerMenuId },
      include: {
        items: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      },
    });
    navItems = (menu?.items ?? []).map((item) => toMenuItemDTO(item, locale));
  }

  const services = await prisma.service.findMany({
    where: { isActive: true, status: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
    take: 6,
    select: { slug: true, title_en: true, title_fa: true },
  });
  const serviceLinks = services.map((s) => ({
    label: pick(s, "title", locale),
    href: `/${locale}/services/${s.slug}`,
  }));

  if (!setting) {
    return {
      tagline: null,
      description: null,
      copyright: null,
      address: null,
      contactEmail: null,
      contactPhone: null,
      businessHours: null,
      socialLinks: [],
      navItems,
      serviceLinks,
    };
  }

  return {
    tagline: pick(setting, "tagline", locale) || null,
    description: pick(setting, "description", locale) || null,
    copyright: pick(setting, "copyright", locale) || null,
    address: pick(setting, "address", locale) || null,
    contactEmail: setting.contactEmail,
    contactPhone: setting.contactPhone,
    businessHours: pick(setting, "businessHours", locale) || null,
    socialLinks: parseSocialLinks(setting.socialLinks),
    navItems,
    serviceLinks,
  };
}

// ---- Admin raw fetchers / CRUD --------------------------------------------

export async function getThemeRaw() {
  return prisma.themeSetting.findFirst({ orderBy: { createdAt: "asc" } });
}

export async function upsertTheme(
  data: Prisma.ThemeSettingUncheckedCreateInput,
) {
  const existing = await prisma.themeSetting.findFirst();
  if (existing) {
    return prisma.themeSetting.update({ where: { id: existing.id }, data });
  }
  return prisma.themeSetting.create({ data });
}
