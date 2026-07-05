import { getMediaMetaMap } from "@/services/media.service";
import { isVideoUrl } from "@/lib/media-url";
import { SiteMedia, type SiteMediaProps } from "./SiteMedia";

/**
 * Server wrapper around SiteMedia that resolves a video's stored cover/poster
 * from the media library, so server renderers can swap <Image> → <SiteMediaServer>
 * with the same props and get video-with-cover for free. Only queries the media
 * map when the src is actually a video.
 */
export async function SiteMediaServer(props: Omit<SiteMediaProps, "poster">) {
  let poster: string | null = null;
  if (isVideoUrl(props.src)) {
    const map = await getMediaMetaMap();
    poster = map.get(props.src)?.poster ?? null;
  }
  return <SiteMedia {...props} poster={poster} />;
}
