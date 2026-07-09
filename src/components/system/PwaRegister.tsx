"use client";

import * as React from "react";

/**
 * Registers the service worker (/sw.js) after the page load settles. The
 * worker is cache-free — it only supplies an offline fallback for navigations
 * — so registration can never serve stale content. Production builds only.
 */
export function PwaRegister() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* unsupported/blocked — the site works fine without it */
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
