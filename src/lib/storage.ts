import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Storage abstraction layer. V1 uses local disk; the interface stays compatible
 * with S3 / R2 / Supabase. UI components MUST go through this — never couple to a
 * provider directly.
 */
export interface StoredFile {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
}

export interface StorageProvider {
  save(file: { buffer: Buffer; fileName: string; mimeType: string }): Promise<StoredFile>;
  delete(fileUrl: string): Promise<void>;
}

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "public/uploads";
const PUBLIC_PREFIX = "/uploads";

function safeName(original: string): string {
  const ext = path.extname(original);
  const base = path
    .basename(original, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const hash = crypto.randomBytes(6).toString("hex");
  return `${base || "file"}-${hash}${ext.toLowerCase()}`;
}

class LocalStorageProvider implements StorageProvider {
  async save(file: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
  }): Promise<StoredFile> {
    const dir = path.join(process.cwd(), UPLOAD_DIR);
    await fs.mkdir(dir, { recursive: true });
    const fileName = safeName(file.fileName);
    await fs.writeFile(path.join(dir, fileName), file.buffer);
    return {
      fileName,
      fileUrl: `${PUBLIC_PREFIX}/${fileName}`,
      mimeType: file.mimeType,
      fileSize: file.buffer.length,
    };
  }

  async delete(fileUrl: string): Promise<void> {
    if (!fileUrl.startsWith(PUBLIC_PREFIX)) return;
    const fileName = fileUrl.slice(PUBLIC_PREFIX.length + 1);
    const filePath = path.join(process.cwd(), UPLOAD_DIR, fileName);
    await fs.rm(filePath, { force: true });
  }
}

function createProvider(): StorageProvider {
  // Switch on STORAGE_PROVIDER to add s3/r2/supabase later without touching callers.
  switch (process.env.STORAGE_PROVIDER) {
    case "local":
    default:
      return new LocalStorageProvider();
  }
}

export const storage: StorageProvider = createProvider();

export function detectMediaType(mimeType: string): "IMAGE" | "VIDEO" | "DOCUMENT" {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  return "DOCUMENT";
}
