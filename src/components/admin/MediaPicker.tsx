"use client";

import * as React from "react";
import Image from "next/image";
import { ImageIcon, Video as VideoIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClient, runMutation } from "@/lib/admin-client";
import { Field } from "@/components/admin/shared";
import { isVideoUrl } from "@/lib/media-url";

interface MediaRow {
  id: string;
  fileName: string;
  fileUrl: string;
  mediaType: string;
  posterUrl?: string | null;
}

/** Small preview tile for a stored media URL (video or image). */
function Thumb({ url, className }: { url: string; className?: string }) {
  if (isVideoUrl(url)) {
    return <video src={url} muted playsInline className={className} />;
  }
  return <Image src={url} alt="" fill sizes="160px" className={className} />;
}

/**
 * URL input + "Browse library" picker. Stores a plain URL string so it works
 * with every content schema's `imageUrl`/`photoUrl` field. Images AND videos are
 * selectable; when a video is picked, a "Cover image" sub-picker sets the poster
 * shown before playback (saved on the media asset).
 */
export function MediaPicker({
  label = "Image",
  value,
  onChange,
  hint,
  accept = "all",
}: {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  /** Optional guidance shown under the field, e.g. recommended dimensions. */
  hint?: string;
  /** "image" restricts the library to images (e.g. a video's cover). */
  accept?: "all" | "image";
}) {
  const [open, setOpen] = React.useState(false);
  const [coverOpen, setCoverOpen] = React.useState(false);
  const [media, setMedia] = React.useState<MediaRow[]>([]);
  const [coverMedia, setCoverMedia] = React.useState<MediaRow[]>([]);
  const [poster, setPoster] = React.useState<string>("");
  const inputId = React.useId();
  const valueIsVideo = isVideoUrl(value);

  const defaultHint =
    accept === "image"
      ? "Max 25 MB · JPG, PNG, WebP, AVIF, GIF, SVG"
      : "Max 25 MB · images or video (MP4/WebM)";

  React.useEffect(() => {
    if (!open) return;
    const q = accept === "image" ? "?mediaType=IMAGE&pageSize=60" : "?pageSize=60";
    apiClient
      .get<{ items: MediaRow[] }>(`/api/admin/media${q}`)
      .then((res) => setMedia(res.items))
      .catch(() => setMedia([]));
  }, [open, accept]);

  // Load the existing cover for a video value so it can be shown/replaced.
  React.useEffect(() => {
    if (!valueIsVideo) {
      setPoster("");
      return;
    }
    apiClient
      .get<{ items: MediaRow[] }>("/api/admin/media?mediaType=VIDEO&pageSize=100")
      .then((res) => setPoster(res.items.find((m) => m.fileUrl === value)?.posterUrl ?? ""))
      .catch(() => setPoster(""));
  }, [value, valueIsVideo]);

  React.useEffect(() => {
    if (!coverOpen) return;
    apiClient
      .get<{ items: MediaRow[] }>("/api/admin/media?mediaType=IMAGE&pageSize=60")
      .then((res) => setCoverMedia(res.items))
      .catch(() => setCoverMedia([]));
  }, [coverOpen]);

  async function saveCover(url: string) {
    const res = await runMutation(
      () => apiClient.patch("/api/admin/media", { fileUrl: value, posterUrl: url }),
      { success: "Cover updated", error: "Could not update cover" },
    );
    if (res) setPoster(url);
    setCoverOpen(false);
  }

  return (
    <Field label={label} htmlFor={inputId} hint={hint ?? defaultHint}>
      <div className="flex items-start gap-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
          {value ? (
            <Thumb url={value} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-[var(--color-text-muted)]">
              <ImageIcon className="size-6" aria-hidden />
            </div>
          )}
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove media"
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

      {/* Cover/poster picker — only for a video value. */}
      {valueIsVideo ? (
        <div className="mt-3 flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            {poster ? (
              <Image src={poster} alt="" fill sizes="56px" className="object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-[var(--color-text-muted)]">
                <VideoIcon className="size-5" aria-hidden />
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-small font-semibold text-[var(--color-text-secondary)]">
              Cover image (shown before the video plays)
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setCoverOpen(true)}>
                {poster ? "Change cover" : "Set cover"}
              </Button>
              {poster ? (
                <button
                  type="button"
                  onClick={() => saveCover("")}
                  className="text-caption text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

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
                <Thumb
                  url={m.fileUrl}
                  className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </button>
            ))}
            {media.length === 0 ? (
              <p className="col-span-full py-8 text-center text-small text-[var(--color-text-muted)]">
                Nothing uploaded yet.
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={coverOpen} onOpenChange={setCoverOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>Choose a cover image</DialogTitle>
          </DialogHeader>
          <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
            {coverMedia.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => saveCover(m.fileUrl)}
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
            {coverMedia.length === 0 ? (
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
