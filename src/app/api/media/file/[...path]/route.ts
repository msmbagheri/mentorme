import { promises as fs } from "fs";
import path from "path";
import type { NextRequest } from "next/server";

/**
 * Serve uploaded media from UPLOAD_DIR. Next.js only serves `public/` files that
 * existed at build time, so runtime uploads (which land in public/uploads on a
 * `next start` / standalone / Docker build) 404 from the static handler. This
 * route streams them directly from disk and works in every deployment mode
 * (point UPLOAD_DIR at a persisted volume in production).
 */
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "public/uploads";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  // Only ever serve a single, sanitized file name — no traversal, no subdirs.
  const fileName = path.basename((segments ?? []).join("/"));
  if (!fileName || fileName === "." || fileName === ".." || fileName.includes("\0")) {
    return new Response("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), UPLOAD_DIR, fileName);
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(fileName).toLowerCase();
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
    return new Response(new Uint8Array(data), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
