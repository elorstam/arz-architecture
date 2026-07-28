import createMiddleware from "next-intl/middleware";
import type {NextRequest} from "next/server";
import {NextResponse} from "next/server";

import {routing} from "./i18n/routing";

const intlProxy = createMiddleware(routing);

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const savedLocale = request.cookies.get("arz-locale")?.value;
    const locale = savedLocale === "en" ? "en" : "tr";
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  return intlProxy(request);
}

export const config = {
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
