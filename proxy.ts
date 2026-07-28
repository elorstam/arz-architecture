import createMiddleware from "next-intl/middleware";
import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

import {routing} from "./i18n/routing";
import {isAppLocale} from "./i18n/locales";

const intlProxy = createMiddleware(routing);

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const savedLocale = request.cookies.get("arz-locale")?.value;
    const locale = savedLocale && isAppLocale(savedLocale) ? savedLocale : "tr";
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return intlProxy(request);
}

export const config = {
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
