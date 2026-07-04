import { requireCan } from "@/lib/admin-session";
import { can } from "@/lib/permissions";
import { getFooterSettingRaw } from "@/services/content.service";
import { listMenus } from "@/services/menu.service";
import { FooterEditor } from "@/components/admin/FooterEditor";

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

export default async function FooterAdminPage() {
  const session = await requireCan("homepage", "read");
  const [footer, menus] = await Promise.all([getFooterSettingRaw(), listMenus()]);

  return (
    <FooterEditor
      canWrite={can(session.role, "update", "homepage")}
      menus={menus.map((m) => ({ id: m.id, internalName: m.internalName }))}
      footer={{
        id: footer?.id ?? null,
        tagline_en: footer?.tagline_en ?? "",
        tagline_fa: footer?.tagline_fa ?? "",
        description_en: footer?.description_en ?? "",
        description_fa: footer?.description_fa ?? "",
        copyright_en: footer?.copyright_en ?? "",
        copyright_fa: footer?.copyright_fa ?? "",
        address_en: footer?.address_en ?? "",
        address_fa: footer?.address_fa ?? "",
        contactEmail: footer?.contactEmail ?? "",
        contactPhone: footer?.contactPhone ?? "",
        businessHours_en: footer?.businessHours_en ?? "",
        businessHours_fa: footer?.businessHours_fa ?? "",
        socialLinks: asSocialLinks(footer?.socialLinks),
        footerMenuId: footer?.footerMenuId ?? "",
      }}
    />
  );
}
