/** Client-safe helpers for reasoning about a stored media URL. */

const VIDEO_EXT = /\.(mp4|webm|ogg|mov|m4v)$/i;

/** True when the URL points at a video file (by extension, query string ignored). */
export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const path = url.split("?")[0].split("#")[0];
  return VIDEO_EXT.test(path);
}
