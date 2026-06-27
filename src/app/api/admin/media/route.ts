import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, created, fail, tooManyRequests } from "@/lib/api-response";
import { assertCan } from "@/lib/permissions";
import { requireAdmin, isResponse, handleApiError } from "@/lib/api/admin-guard";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security";
import { listMedia, createMedia, deleteMedia, updateMedia } from "@/services/media.service";
import { record } from "@/services/audit.service";
import { mediaUploadMetaSchema, mediaUpdateSchema } from "@/lib/validation/media.schema";
import type { MediaType } from "@prisma/client";

const MEDIA_TYPES = ["IMAGE", "VIDEO", "DOCUMENT"];

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "read", "media");

    const params = req.nextUrl.searchParams;
    const typeParam = params.get("mediaType");
    const mediaType =
      typeParam && MEDIA_TYPES.includes(typeParam) ? (typeParam as MediaType) : undefined;
    return ok(
      await listMedia({
        mediaType,
        search: params.get("search") ?? undefined,
        page: params.get("page") ? Number(params.get("page")) : undefined,
        pageSize: params.get("pageSize") ? Number(params.get("pageSize")) : undefined,
      }),
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "create", "media");

    const limit = rateLimit(
      `media:${getClientIp(req)}`,
      RATE_LIMITS.MEDIA_UPLOAD.limit,
      RATE_LIMITS.MEDIA_UPLOAD.windowMs,
    );
    if (!limit.success) return tooManyRequests("Too many uploads. Please try again later.");

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return fail("NO_FILE", "A file is required.", 400);
    }

    // Enforce mime-type allowlist + max size (server-side hardening).
    const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
    const ALLOWED_MIME = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",
      "image/svg+xml",
      "video/mp4",
      "video/webm",
      "application/pdf",
    ];
    const mime = file.type || "application/octet-stream";
    if (!ALLOWED_MIME.includes(mime)) {
      return fail("UNSUPPORTED_MEDIA_TYPE", `File type "${mime}" is not allowed.`, 415);
    }
    if (file.size > MAX_BYTES) {
      return fail("FILE_TOO_LARGE", "File exceeds the 25MB limit.", 413);
    }

    const meta = mediaUploadMetaSchema.parse({
      altText_en: form.get("altText_en") ?? undefined,
      altText_fa: form.get("altText_fa") ?? undefined,
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await createMedia({
      buffer,
      fileName: file.name,
      mimeType: mime,
      altText_en: meta.altText_en ?? null,
      altText_fa: meta.altText_fa ?? null,
      createdBy: ctx.userId,
    });
    await record({
      userId: ctx.userId,
      action: "CREATE",
      entityType: "MediaAsset",
      entityId: asset.id,
      details: `Uploaded media ${asset.fileName}.`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return created(asset);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "update", "media");

    const body = await req.json().catch(() => ({}));
    const { id, ...data } = mediaUpdateSchema.parse(body);
    const asset = await updateMedia(id, data);
    await record({
      userId: ctx.userId,
      action: "UPDATE",
      entityType: "MediaAsset",
      entityId: id,
      details: "Updated media metadata.",
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return ok(asset);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;
    assertCan(ctx.role, "delete", "media");

    const id = z.string().uuid().parse(req.nextUrl.searchParams.get("id"));
    await deleteMedia(id);
    await record({
      userId: ctx.userId,
      action: "DELETE",
      entityType: "MediaAsset",
      entityId: id,
      details: "Deleted media asset.",
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return ok({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
