import "server-only";
import type { MenuItem, MenuItemType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { pick } from "@/lib/i18n";
import type { AppLocale } from "@/types/locale";
import type { MenuItemDTO } from "@/types/cms";

function resolveMenuHref(item: MenuItem, locale: AppLocale): { href: string; external: boolean } {
  switch (item.type) {
    case "SCROLL_TO_SECTION": {
      const anchor = item.sectionAnchor ?? "";
      const normalized = anchor.startsWith("#") ? anchor.slice(1) : anchor;
      return { href: `/${locale}#${normalized}`, external: false };
    }
    case "INTERNAL_PAGE": {
      const url = item.internalUrl ?? "/";
      if (/^https?:\/\//.test(url)) return { href: url, external: true };
      const path = url.startsWith("/") ? url : `/${url}`;
      const href =
        path === `/${locale}` || path.startsWith(`/${locale}/`)
          ? path
          : `/${locale}${path}`;
      return { href, external: false };
    }
    case "EXTERNAL_URL":
      return { href: item.externalUrl ?? "#", external: true };
    default:
      return { href: "#", external: false };
  }
}

export function toMenuItemDTO(item: MenuItem, locale: AppLocale): MenuItemDTO {
  const { href, external } = resolveMenuHref(item, locale);
  return {
    id: item.id,
    label: pick(item, "label", locale),
    href,
    type: item.type,
    external,
  };
}

/** Public, localized menu by internal name (e.g. "header", "footer"). */
export async function getMenu(
  internalName: string,
  locale: AppLocale,
): Promise<MenuItemDTO[]> {
  const menu = await prisma.menu.findUnique({
    where: { internalName },
    include: {
      items: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  if (!menu) return [];
  return menu.items.map((item) => toMenuItemDTO(item, locale));
}

// ---- Admin raw fetchers / CRUD --------------------------------------------

export async function listMenus() {
  return prisma.menu.findMany({
    orderBy: { internalName: "asc" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getMenuRaw(internalName: string) {
  return prisma.menu.findUnique({
    where: { internalName },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function createMenu(internalName: string) {
  return prisma.menu.create({ data: { internalName } });
}

export async function deleteMenu(id: string) {
  return prisma.menu.delete({ where: { id } });
}

export async function createMenuItem(data: {
  menuId: string;
  label_en: string;
  label_fa: string;
  type: MenuItemType;
  internalUrl?: string | null;
  externalUrl?: string | null;
  sectionAnchor?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}) {
  return prisma.menuItem.create({ data });
}

export async function updateMenuItem(
  id: string,
  data: Partial<{
    label_en: string;
    label_fa: string;
    type: MenuItemType;
    internalUrl: string | null;
    externalUrl: string | null;
    sectionAnchor: string | null;
    sortOrder: number;
    isActive: boolean;
  }>,
) {
  return prisma.menuItem.update({ where: { id }, data });
}

export async function deleteMenuItem(id: string) {
  return prisma.menuItem.delete({ where: { id } });
}
