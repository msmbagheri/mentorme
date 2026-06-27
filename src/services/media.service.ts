import "server-only";
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
