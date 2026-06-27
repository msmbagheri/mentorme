"use client";

import { useEffect } from "react";

const CHUNK_ERROR_RE =
  /ChunkLoadError|Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i;

function isChunkError(message?: string | null): boolean {
  return !!message && CHUNK_ERROR_RE.test(message);
}

/**
 * After a new deployment/rebuild the JS chunk hashes change, so a browser tab
 * still running an old build can fail to load a chunk on navigation
 * (ChunkLoadError) and show a generic client-side exception. This listener
 * detects that specific failure and silently reloads the page ONCE to fetch the
 * fresh build. A sessionStorage timestamp guard prevents reload loops.
 */
export function ChunkErrorReloader() {
  useEffect(() => {
    const KEY = "__mm_chunk_reload_at";

    const reloadedRecently = () => {
      try {
        const v = sessionStorage.getItem(KEY);
        return v !== null && Date.now() - Number(v) < 15_000;
      } catch {
        return false;
      }
    };

    const trigger = (message?: string | null) => {
      if (!isChunkError(message) || reloadedRecently()) return;
      try {
        sessionStorage.setItem(KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
      window.location.reload();
    };

    const onError = (e: ErrorEvent) => trigger(e?.message || e?.error?.message);
    const onRejection = (e: PromiseRejectionEvent) => {
      const reason = e?.reason as { message?: string } | string | undefined;
      trigger(typeof reason === "string" ? reason : reason?.message);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
