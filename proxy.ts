import createMiddleware from "next-intl/middleware";
import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

import {routing} from "./i18n/routing";
import {refreshStudioSession} from "./lib/studio/supabase/middleware";
import {CLIENT_REQUEST_PATH_HEADER, getHostRouteDecision} from "./lib/routing/app-domains";

const intlProxy = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const decision = getHostRouteDecision(host, request.nextUrl.pathname, request.nextUrl.search);

  const upstreamHeaders = (clientPath?: string) => {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.delete(CLIENT_REQUEST_PATH_HEADER);
    if (clientPath) requestHeaders.set(CLIENT_REQUEST_PATH_HEADER, clientPath);
    return requestHeaders;
  };

  if(request.nextUrl.pathname.startsWith("/odeme/")){
    const requestHeaders=upstreamHeaders();requestHeaders.set("x-arz-sensitive-public-route","1");
    return NextResponse.next({request:{headers:requestHeaders},headers:{"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow"}});
  }

  if (decision.kind === "redirect") {
    return NextResponse.redirect(decision.url, 308);
  }

  if (decision.kind === "rewrite") {
    const destination = request.nextUrl.clone();
    destination.pathname = decision.pathname;
    const clientPath = decision.pathname === "/client" || decision.pathname.startsWith("/client/")
      ? `${decision.pathname}${request.nextUrl.search}`
      : undefined;
    return refreshStudioSession(request, () => NextResponse.rewrite(destination, {
      request: {headers: upstreamHeaders(clientPath)},
    }));
  }

  if (
    request.nextUrl.pathname === "/studio" ||
    request.nextUrl.pathname.startsWith("/studio/") ||
    request.nextUrl.pathname.startsWith("/api/studio/") ||
    request.nextUrl.pathname === "/client" ||
    request.nextUrl.pathname.startsWith("/client/")
  ) {
    const clientPath = request.nextUrl.pathname === "/client" || request.nextUrl.pathname.startsWith("/client/")
      ? `${request.nextUrl.pathname}${request.nextUrl.search}`
      : undefined;
    return refreshStudioSession(request, () => NextResponse.next({
      request: {headers: upstreamHeaders(clientPath)},
    }));
  }
  return intlProxy(request);
}

export const config = {
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
