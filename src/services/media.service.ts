import "server-only";
import { cache } from "react";
import type { MediaType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { storage, detectMediaType } from "@/lib/storage";

export interface MediaFilters {
  mediaType?: MediaType;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listMedia(filters: MediaFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 40));

  const where: Prisma.MediaAssetWhereInput = {};
  if (filters.mediaType) where.mediaType = filters.mediaType;
  if (filters.search) {
    where.fileName = { contains: filters.search, mode: "insensitive" };
  }

  const [total, items] = await Promise.all([
    prisma.mediaAsset.count({ where }),
    prisma.mediaAsset.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { items, total, page, pageSize };
}

export interface CreateMediaInput {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  altText_en?: string | null;
  altText_fa?: string | null;
  width?: number | null;
  height?: number | null;
  createdBy?: string | null;
}

/** Persist an upload through the storage abstraction, then record the asset. */
export async function createMedia(input: CreateMediaInput) {
  const stored = await storage.save({
    buffer: input.buffer,
    fileName: input.fileName,
    mimeType: input.mimeType,
  });
  const mediaType: MediaType = detectMediaType(input.mimeType);

  return prisma.mediaAsset.create({
    data: {
      fileName: stored.fileName,
      fileUrl: stored.fileUrl,
      mediaType,
      mimeType: stored.mimeType,
      fileSize: stored.fileSize,
      width: input.width ?? null,
      height: input.height ?? null,
      altText_en: input.altText_en ?? null,
      altText_fa: input.altText_fa ?? null,
      createdBy: input.createdBy ?? null,
    },
  });
}

export async function getMedia(id: string) {
  return prisma.mediaAsset.findUnique({ where: { id } });
}

/**
 * Request-cached map of every asset's URL → { type, poster }. Public renderers
 * use it to decide image-vs-video and to find a video's cover. React `cache`
 * dedupes it to a single query per request across all SiteMedia instances.
 */
export const getMediaMetaMap = cache(
  async (): Promise<Map<string, { type: MediaType; poster: string | null }>> => {
    const rows = await prisma.mediaAsset.findMany({
      select: { fileUrl: true, mediaType: true, posterUrl: true },
    });
    const map = new Map<string, { type: MediaType; poster: string | null }>();
    for (const r of rows) map.set(r.fileUrl, { type: r.mediaType, poster: r.posterUrl });
    return map;
  },
);

/** Set (or clear) the poster/cover image for the asset(s) at a given file URL. */
export async function setMediaPosterByUrl(fileUrl: string, posterUrl: string | null) {
  return prisma.mediaAsset.updateMany({ where: { fileUrl }, data: { posterUrl } });
}

export async function updateMedia(
  id: string,
  data: Partial<{ altText_en: string | null; altText_fa: string | null }>,
) {
  return prisma.mediaAsset.update({ where: { id }, data });
}

/** Delete an asset from storage and the DB. */
export async function deleteMedia(id: string) {
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return null;
  await storage.delete(asset.fileUrl);
  return prisma.mediaAsset.delete({ where: { id } });
}
