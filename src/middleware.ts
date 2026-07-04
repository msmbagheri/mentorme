import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { LOCALES, DEFAULT_LOCALE, type AppLocale } from "@/types/locale";

const { auth } = NextAuth(authConfig);

const PUBLIC_FILE = /\.(.*)$/;

function nextWithLocale(req: Request, locale: AppLocale) {
  const headers = new Headers(req.headers);
  headers.set("x-locale", locale);
  return NextResponse.next({ request: { headers } });
}

export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;

  // Skip Next internals, API routes, and static assets.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/uploads") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Admin area (not locale-prefixed): protect everything except the login page.
  if (pathname.startsWith("/admin")) {
    const isLoggedIn = !!req.auth;
    const isLoginPage = pathname === "/admin/login";

    if (isLoginPage) {
      // Bounce already-authenticated users to the dashboard — unless a Node-side
      // guard sent them here with `expired` because their token is stale
      // (password changed / session expired). Edge can't check staleness, so we
      // honor that flag to avoid a login⇄dashboard redirect loop.
      const expired = nextUrl.searchParams.get("expired") === "1";
      if (isLoggedIn && !expired) return NextResponse.redirect(new URL("/admin", nextUrl));
      return nextWithLocale(req, "en");
    }

    if (!isLoggedIn) {
      const loginUrl = new URL("/admin/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return nextWithLocale(req, "en");
  }

  // Locale routing for the public site.
  const matched = LOCALES.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  if (!matched) {
    const target = pathname === "/" ? "" : pathname;
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}${target}`, nextUrl));
  }

  return nextWithLocale(req, matched);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
