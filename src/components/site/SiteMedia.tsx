"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { isVideoUrl } from "@/lib/media-url";

export interface SiteMediaProps {
  src: string;
  alt: string;
  /** Cover/poster shown before a video plays. Ignored for images. */
  poster?: string | null;
  className?: string;
  /** Fill the (relative, sized) parent — mirrors next/image `fill`. */
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  /** Decorative/background video: autoplay + muted + loop, no controls. */
  background?: boolean;
}

/**
 * Renders a stored media URL as a <video> (with optional poster/cover) when it's
 * a video file, otherwise as an optimized next/image. A single component used in
 * every place the site shows uploaded media, so images and videos are
 * interchangeable everywhere.
 */
export function SiteMedia({
  src,
  alt,
  poster,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
  background,
}: SiteMediaProps) {
  if (isVideoUrl(src)) {
    return (
      <video
        src={src}
        poster={poster ?? undefined}
        aria-label={alt}
        playsInline
        preload="metadata"
        className={fill ? cn("absolute inset-0 h-full w-full", className) : className}
        {...(background
          ? { autoPlay: true, muted: true, loop: true }
          : { controls: true })}
        {...(!fill && width ? { width } : {})}
        {...(!fill && height ? { height } : {})}
      />
    );
  }

  if (fill) {
    return (
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 0}
      height={height ?? 0}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
