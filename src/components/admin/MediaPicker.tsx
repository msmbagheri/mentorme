"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/admin-client";
import { Field } from "@/components/admin/shared";

interface MediaRow {
  id: string;
  fileName: string;
  fileUrl: string;
  mediaType: string;
}

/**
 * URL input + "Browse library" picker. Stores a plain URL string so it works
 * with every content schema's `imageUrl`/`photoUrl` field.
 */
export function MediaPicker({
  label = "Image",
  value,
  onChange,
  hint,
}: {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  /** Optional guidance shown under the field, e.g. recommended dimensions. */
  hint?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [media, setMedia] = React.useState<MediaRow[]>([]);
  const inputId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    apiClient
      .get<{ items: MediaRow[] }>("/api/admin/media?mediaType=IMAGE&pageSize=60")
      .then((res) => setMedia(res.items))
      .catch(() => setMedia([]));
  }, [open]);

  return (
    <Field label={label} htmlFor={inputId} hint={hint ?? "Max 25 MB · JPG, PNG, WebP, AVIF, GIF, SVG"}>
      <div className="flex items-start gap-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
          {value ? (
            <Image src={value} alt="" fill sizes="80px" className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-[var(--color-text-muted)]">
              <ImageIcon className="size-6" aria-hidden />
            </div>
          )}
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove image"
              className="absolute inset-inline-end-1 top-1 rounded-full bg-black/60 p-0.5 text-white end-1"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Input
            id={inputId}
            dir="ltr"
            placeholder="https://… or pick from library"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
            Browse library
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Media library</DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
            {media.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onChange(m.fileUrl);
                  setOpen(false);
                }}
                className="group relative aspect-square overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-blend)]"
              >
                <Image
                  src={m.fileUrl}
                  alt={m.fileName}
                  fill
                  sizes="160px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </button>
            ))}
            {media.length === 0 ? (
              <p className="col-span-full py-8 text-center text-small text-[var(--color-text-muted)]">
                No images uploaded yet.
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </Field>
  );
}
