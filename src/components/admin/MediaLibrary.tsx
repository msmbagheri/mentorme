"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Trash2, Copy, Check, Loader2, FileText, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiClient, runMutation } from "@/lib/admin-client";
import { toast } from "@/components/ui/use-toast";
import { PageHeader, Field, EmptyState, ReadOnlyNotice } from "@/components/admin/shared";

interface MediaRow {
  id: string;
  fileName: string;
  fileUrl: string;
  mediaType: string;
  altText_en: string | null;
  altText_fa: string | null;
}

export function MediaLibrary({
  initialItems,
  canWrite,
  canDelete,
}: {
  initialItems: MediaRow[];
  canWrite: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = React.useState<MediaRow[]>(initialItems);
  const [typeFilter, setTypeFilter] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [editing, setEditing] = React.useState<MediaRow | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => setItems(initialItems), [initialItems]);

  const visible = items.filter(
    (m) =>
      (!typeFilter || m.mediaType === typeFilter) &&
      (!search || m.fileName.toLowerCase().includes(search.toLowerCase())),
  );

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await runMutation(
      () => apiClient.upload<MediaRow>("/api/admin/media", form),
      { success: "Uploaded", error: "Upload failed" },
    );
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
    if (res) router.refresh();
  }

  async function remove(id: string) {
    const res = await runMutation(() => apiClient.delete(`/api/admin/media?id=${id}`), {
      success: "Deleted",
      error: "Delete failed",
    });
    if (res) router.refresh();
  }

  async function saveAlt() {
    if (!editing) return;
    const res = await runMutation(
      () =>
        apiClient.patch("/api/admin/media", {
          id: editing.id,
          altText_en: editing.altText_en ?? "",
          altText_fa: editing.altText_fa ?? "",
        }),
      { success: "Saved", error: "Could not save" },
    );
    if (res) {
      setEditing(null);
      router.refresh();
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(url);
      toast({ title: "URL copied", variant: "success" });
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <div>
      <PageHeader title="Media Library" description="Upload and manage images, video and documents.">
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-11 w-40"
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          <option value="IMAGE">Images</option>
          <option value="VIDEO">Video</option>
          <option value="DOCUMENT">Documents</option>
        </Select>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="h-11 w-44"
          aria-label="Search media"
        />
        {canWrite ? (
          <>
            <input
              ref={fileInput}
              type="file"
              className="hidden"
              onChange={onUpload}
              accept="image/*,video/*,application/pdf"
            />
            <Button
              variant="cta"
              size="sm"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              Upload
            </Button>
          </>
        ) : null}
      </PageHeader>

      {canWrite ? (
        <p className="mb-4 text-caption text-[var(--color-text-muted)]">
          Max 25&nbsp;MB per file · Allowed: JPG, PNG, WebP, AVIF, GIF, SVG, MP4, WebM, PDF · up to
          30 uploads/hour
        </p>
      ) : null}

      {!canWrite ? <ReadOnlyNotice className="mb-4" /> : null}

      {visible.length === 0 ? (
        <EmptyState title="No media found" description="Upload images to use across the site." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((m) => (
            <div
              key={m.id}
              className="group overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]"
            >
              <div className="relative aspect-square bg-[var(--color-surface-alt)]">
                {m.mediaType === "IMAGE" ? (
                  <Image src={m.fileUrl} alt={m.altText_en ?? m.fileName} fill sizes="200px" className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-[var(--color-text-muted)]">
                    {m.mediaType === "VIDEO" ? (
                      <Video className="size-10" />
                    ) : (
                      <FileText className="size-10" />
                    )}
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-caption font-medium text-[var(--color-text-primary)]">
                  {m.fileName}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label="Copy URL"
                    onClick={() => copyUrl(m.fileUrl)}
                  >
                    {copied === m.fileUrl ? (
                      <Check className="size-4 text-[var(--color-success)]" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                  {canWrite ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => setEditing(m)}
                    >
                      Alt
                    </Button>
                  ) : null}
                  {canDelete ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Delete"
                      onClick={() => remove(m.id)}
                    >
                      <Trash2 className="size-4 text-[var(--color-error)]" />
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Alt text</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="flex flex-col gap-4">
              <Field label="Alt text (EN)" htmlFor="alt-en">
                <Input
                  id="alt-en"
                  dir="ltr"
                  value={editing.altText_en ?? ""}
                  onChange={(e) => setEditing({ ...editing, altText_en: e.target.value })}
                />
              </Field>
              <Field label="Alt text (FA)" htmlFor="alt-fa">
                <Input
                  id="alt-fa"
                  dir="rtl"
                  value={editing.altText_fa ?? ""}
                  onChange={(e) => setEditing({ ...editing, altText_fa: e.target.value })}
                />
              </Field>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button variant="cta" size="sm" onClick={saveAlt}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
