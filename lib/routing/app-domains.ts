export type ArzAppScope = "public" | "studio" | "client";

const DEFAULT_ORIGINS = {
  public: "https://arzmimarlik.net",
  studio: "https://portal.arzmimarlik.net",
  client: "https://client.arzmimarlik.net",
} as const;

function configuredOrigin(scope: ArzAppScope) {
  const value = scope === "public"
    ? process.env.NEXT_PUBLIC_SITE_URL
    : scope === "studio"
      ? process.env.NEXT_PUBLIC_STUDIO_URL
      : process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL;
  try {
    return new URL(value || DEFAULT_ORIGINS[scope]).origin;
  } catch {
    return DEFAULT_ORIGINS[scope];
  }
}

export function appBaseUrl(scope: ArzAppScope) {
  const value = scope === "public"
    ? process.env.NEXT_PUBLIC_SITE_URL
    : scope === "studio"
      ? process.env.NEXT_PUBLIC_STUDIO_URL
      : process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL;

  try {
    const url = new URL(value || DEFAULT_ORIGINS[scope]);
    const pathname = url.pathname.replace(/\/+$/, "");
    return `${url.origin}${pathname === "/" ? "" : pathname}`;
  } catch {
    return DEFAULT_ORIGINS[scope];
  }
}

export function normalizeHostname(value: string | null | undefined) {
  const candidate = (value || "").split(",", 1)[0]?.trim().toLowerCase() || "";
  if (candidate.startsWith("[")) return candidate.slice(1, candidate.indexOf("]"));
  return candidate.split(":", 1)[0];
}

export function isLocalHostname(value: string | null | undefined) {
  const hostname = normalizeHostname(value);
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.endsWith(".localhost");
}

export function appHostname(scope: ArzAppScope) {
  return new URL(configuredOrigin(scope)).hostname.toLowerCase();
}

export function appOrigin(scope: ArzAppScope) {
  return configuredOrigin(scope);
}

export function scopeForHostname(value: string | null | undefined): ArzAppScope | "local" | "unknown" {
  const hostname = normalizeHostname(value);
  if (isLocalHostname(hostname)) return "local";
  if (hostname === appHostname("studio")) return "studio";
  if (hostname === appHostname("client")) return "client";
  if (hostname === appHostname("public") || hostname === `www.${appHostname("public")}`) return "public";
  return "unknown";
}

export function internalAppPath(scope: Exclude<ArzAppScope, "public">, externalPathname: string) {
  const prefix = scope === "studio" ? "/studio" : "/client";
  return externalPathname === "/" ? prefix : `${prefix}${externalPathname}`;
}

export function cleanAppPath(scope: Exclude<ArzAppScope, "public">, internalPathname: string) {
  const prefix = scope === "studio" ? "/studio" : "/client";
  if (internalPathname === prefix) return "/";
  return internalPathname.startsWith(`${prefix}/`) ? internalPathname.slice(prefix.length) : internalPathname;
}

export function appDestination(scope: Exclude<ArzAppScope, "public">, internalPath: string, requestHost?: string | null) {
  const hostScope = scopeForHostname(requestHost);
  if (hostScope === "local" || hostScope === "unknown") return internalPath;
  const clean = cleanAppPath(scope, internalPath);
  return hostScope === scope ? clean : `${appOrigin(scope)}${clean}`;
}

export function clientNavigationPath(scope: Exclude<ArzAppScope, "public">, internalPath: string, currentPathname: string) {
  const prefix = scope === "studio" ? "/studio" : "/client";
  return currentPathname === prefix || currentPathname.startsWith(`${prefix}/`)
    ? internalPath
    : cleanAppPath(scope, internalPath);
}

export function isInfrastructurePath(pathname: string) {
  return pathname === "/favicon.ico" || pathname === "/robots.txt" || pathname === "/sitemap.xml" ||
    pathname.startsWith("/_next/") || pathname.startsWith("/_vercel/") || pathname.startsWith("/api/");
}

export type HostRouteDecision =
  | {kind: "next"}
  | {kind: "rewrite"; pathname: string}
  | {kind: "redirect"; url: string};

export function getHostRouteDecision(host: string | null | undefined, pathname: string, search = ""): HostRouteDecision {
  const scope = scopeForHostname(host);
  if (scope === "local" || scope === "unknown" || isInfrastructurePath(pathname)) return {kind: "next"};

  if (scope === "public") {
    if (pathname === "/studio" || pathname.startsWith("/studio/")) {
      return {kind: "redirect", url: `${appOrigin("studio")}${cleanAppPath("studio", pathname)}${search}`};
    }
    if (pathname === "/client" || pathname.startsWith("/client/")) {
      return {kind: "redirect", url: `${appOrigin("client")}${cleanAppPath("client", pathname)}${search}`};
    }
    return {kind: "next"};
  }

  const prefix = scope === "studio" ? "/studio" : "/client";
  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
    return {kind: "redirect", url: `${appOrigin(scope)}${cleanAppPath(scope, pathname)}${search}`};
  }
  return {kind: "rewrite", pathname: internalAppPath(scope, pathname)};
}

export function createClientInvitationUrl(requestUrl: string, token: string) {
  const request = new URL(requestUrl);
  const local = isLocalHostname(request.hostname);
  const origin = local ? request.origin : appOrigin("client");
  const path = local ? "/client/invite/" : "/invite/";
  return `${origin}${path}${encodeURIComponent(token)}`;
}
