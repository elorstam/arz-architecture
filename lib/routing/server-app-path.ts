import "server-only";

import {headers} from "next/headers";
import {appDestination, type ArzAppScope} from "@/lib/routing/app-domains";

export async function serverAppPath(scope: Exclude<ArzAppScope, "public">, internalPath: string) {
  const requestHeaders = await headers();
  return appDestination(scope, internalPath, requestHeaders.get("x-forwarded-host") || requestHeaders.get("host"));
}
