import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { getThemeRaw } from "@/services/theme.service";
import { ThemeEditor } from "@/components/admin/ThemeEditor";

export const dynamic = "force-dynamic";

interface SocialLink {
  platform: string;
  url: string;
}

function asSocialLinks(value: unknown): SocialLink[] {
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

function asContact(value: unknown) {
  const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return {
    email: typeof v.email === "string" ? v.email : "",
    phone: typeof v.phone === "string" ? v.phone : "",
    address: typeof v.address === "string" ? v.address : "",
    hours: typeof v.hours === "string" ? v.hours : "",
  };
}

export default async function ThemeAdminPage() {
  const session = await requireCan("theme", "read");
  const theme = await getThemeRaw();

  return (
    <ThemeEditor
      canWrite={can(session.role, "update", "theme")}
      theme={{
        brandName: theme?.brandName ?? "MentorMe",
        tagline_en: theme?.tagline_en ?? "",
        tagline_fa: theme?.tagline_fa ?? "",
        primaryLogoUrl: theme?.primaryLogoUrl ?? "",
        darkLogoUrl: theme?.darkLogoUrl ?? "",
        mobileLogoUrl: theme?.mobileLogoUrl ?? "",
        faviconUrl: theme?.faviconUrl ?? "",
        primaryColor: theme?.primaryColor ?? "",
        accentColor: theme?.accentColor ?? "",
        ctaGradientStart: theme?.ctaGradientStart ?? "",
        ctaGradientEnd: theme?.ctaGradientEnd ?? "",
        fontFamilyLatin: theme?.fontFamilyLatin ?? "",
        fontFamilyPersian: theme?.fontFamilyPersian ?? "",
        fontUrlLatin: theme?.fontUrlLatin ?? "",
        fontUrlPersian: theme?.fontUrlPersian ?? "",
        socialLinks: asSocialLinks(theme?.socialLinks),
        contactInformation: asContact(theme?.contactInformation),
      }}
    />
  );
}
