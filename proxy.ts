import createMiddleware from "next-intl/middleware";
import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

import {routing} from "./i18n/routing";
import {refreshStudioSession} from "./lib/studio/supabase/middleware";
import {getHostRouteDecision} from "./lib/routing/app-domains";

const intlProxy = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const decision = getHostRouteDecision(host, request.nextUrl.pathname, request.nextUrl.search);

  if (decision.kind === "redirect") {
    return NextResponse.redirect(decision.url, 308);
  }

  if (decision.kind === "rewrite") {
    const destination = request.nextUrl.clone();
    destination.pathname = decision.pathname;
    return refreshStudioSession(request, () => NextResponse.rewrite(destination, {request}));
  }

  if (
    request.nextUrl.pathname === "/studio" ||
    request.nextUrl.pathname.startsWith("/studio/") ||
    request.nextUrl.pathname.startsWith("/api/studio/") ||
    request.nextUrl.pathname === "/client" ||
    request.nextUrl.pathname.startsWith("/client/")
  ) {
    return refreshStudioSession(request);
  }
  return intlProxy(request);
}

export const config = {
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
