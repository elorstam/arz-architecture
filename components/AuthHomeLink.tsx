import {headers} from "next/headers";

import {
  appOrigin,
  isLocalHostname,
} from "@/lib/routing/app-domains";

export default async function AuthHomeLink() {
  const requestHeaders = await headers();

  const requestHost = (
    requestHeaders.get("x-forwarded-host") ||
    requestHeaders.get("host") ||
    ""
  )
    .split(",", 1)[0]
    .trim();

  const forwardedProtocol = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",", 1)[0]
    .trim();

  const protocol =
    forwardedProtocol === "https"
      ? "https"
      : "http";

  const publicHomeHref = isLocalHostname(requestHost)
    ? new URL(`${protocol}://${requestHost}`).origin
    : appOrigin("public");

  return (
    <a
      href={publicHomeHref}
      className="auth-home-link fixed left-5 top-5 z-[9999] inline-flex items-center gap-2 text-[12px] font-normal leading-5 tracking-[0.025em] text-slate-500 no-underline transition-[color,transform] duration-200 hover:-translate-x-0.5 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 dark:text-slate-300 dark:hover:text-white sm:left-7 sm:top-7"
      style={{fontFamily:'"Century Gothic", Arial, Helvetica, sans-serif'}}
      aria-label="Anasayfaya dön"
    >
      <span aria-hidden="true">←</span>
      <span>Anasayfaya dön</span>
    </a>
  );
}
