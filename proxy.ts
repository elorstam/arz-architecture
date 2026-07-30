import createMiddleware from "next-intl/middleware";
import type {NextRequest} from "next/server";

import {routing} from "./i18n/routing";
import {refreshStudioSession} from "./lib/studio/supabase/middleware";

const intlProxy = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname === "/studio" ||
    request.nextUrl.pathname.startsWith("/studio/") ||
    request.nextUrl.pathname.startsWith("/api/studio/")
  ) {
    return refreshStudioSession(request);
  }
  return intlProxy(request);
}

export const config = {
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
