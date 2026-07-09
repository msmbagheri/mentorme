/*
 * MentorMe service worker — deliberately cache-free.
 *
 * Its only job is PWA installability plus a friendly offline page for
 * navigations. It never caches site content: every request goes straight to
 * the network, so a bad cache can never serve stale CMS pages. If the network
 * is unreachable, navigations get the inline bilingual fallback below.
 */

const OFFLINE_HTML = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>آفلاین | Offline</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       font-family:Vazirmatn,Tahoma,Arial,sans-serif;background:#f8fafc;color:#0f172a;text-align:center}
  main{padding:2rem;max-width:26rem}
  h1{font-size:1.4rem;margin:0 0 .75rem}
  p{margin:.25rem 0;color:#475569;line-height:1.9}
  .en{direction:ltr;font-family:Arial,sans-serif}
  button{margin-top:1.5rem;padding:.7rem 2.2rem;font-size:1rem;border:0;border-radius:.6rem;
         background:#1e3a8a;color:#fff;cursor:pointer;font-family:inherit}
</style>
</head>
<body>
<main>
  <h1>اتصال اینترنت برقرار نیست</h1>
  <p>لطفاً اتصال خود را بررسی کنید و دوباره تلاش کنید.</p>
  <p class="en">You appear to be offline. Please check your connection and try again.</p>
  <button onclick="location.reload()">تلاش دوباره / Retry</button>
</main>
</body>
</html>`;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Only navigations get the offline fallback; everything else is untouched.
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(
      () =>
        new Response(OFFLINE_HTML, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
    ),
  );
});
