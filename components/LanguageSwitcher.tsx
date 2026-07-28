"use client";

import {useEffect, useRef, useState} from "react";
import {useLocale} from "next-intl";
import {usePathname} from "next/navigation";
import {Manrope} from "next/font/google";
import {getProjectBySlug, getProjectSlug} from "@/data/projects";
import {isAppLocale, localeNames, locales, type AppLocale} from "@/i18n/locales";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  display: "swap",
});

export default function LanguageSwitcher({mobile = false, onNavigate}: {mobile?: boolean; onNavigate?: () => void}) {
  const currentLocaleValue = useLocale();
  const currentLocale: AppLocale = isAppLocale(currentLocaleValue) ? currentLocaleValue : "tr";
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const hrefFor = (targetLocale: AppLocale) => {
    const localePattern = new RegExp(`^/(${locales.join("|")})(?=/|$)`);
    const pathWithoutLocale = pathname.replace(localePattern, "") || "/";
    const segments = pathWithoutLocale.split("/").filter(Boolean);
    const currentUsesTurkishRoutes = currentLocale === "tr";
    const targetUsesTurkishRoutes = targetLocale === "tr";

    const routeMap: Record<string, string> = targetUsesTurkishRoutes
      ? {about: "hakkimizda", projects: "projeler", contact: "iletisim", hakkimizda: "hakkimizda", projeler: "projeler", iletisim: "iletisim"}
      : {about: "about", projects: "projects", contact: "contact", hakkimizda: "about", projeler: "projects", iletisim: "contact"};

    if (segments[0]) segments[0] = routeMap[segments[0]] ?? segments[0];

    const isProjectDetail = (currentUsesTurkishRoutes ? pathWithoutLocale.startsWith("/projeler/") : pathWithoutLocale.startsWith("/projects/")) && Boolean(segments[1]);
    if (isProjectDetail) {
      const project = getProjectBySlug(segments[1]);
      if (project) segments[1] = getProjectSlug(project, targetLocale === "tr" ? "tr" : "en");
    }

    return `/${targetLocale}${segments.length ? `/${segments.join("/")}` : ""}`;
  };

  const choose = (targetLocale: AppLocale) => {
    window.localStorage.setItem("arz-locale", targetLocale);

    const googleLocale = targetLocale === "zh" ? "zh-CN" : targetLocale;
    const googleCookie = targetLocale === "tr" || targetLocale === "en"
      ? ""
      : `/en/${googleLocale}`;

    const expires = googleCookie ? "Max-Age=31536000" : "Max-Age=0";
    document.cookie = `googtrans=${googleCookie}; Path=/; ${expires}; SameSite=Lax`;
    document.cookie = `googtrans=${googleCookie}; Path=/; Domain=.${window.location.hostname}; ${expires}; SameSite=Lax`;

    document.cookie = `arz-locale=${targetLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div ref={rootRef} className={`${manrope.className} notranslate relative ${mobile ? "w-full" : ""}`} translate="no">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Select language"
        className={mobile
          ? "language-switcher-trigger flex w-full items-center justify-between border border-white/18 px-4 py-3 text-[10px] font-normal uppercase tracking-[0.18em] text-white/70"
          : "language-switcher-trigger flex h-10 min-w-[92px] items-center justify-center gap-2 border border-white/18 px-3 text-[10px] font-normal uppercase tracking-[0.14em] text-white/70 transition hover:border-white/45 hover:text-white"}
      >
        <span>{localeNames[currentLocale]}</span><span className="text-[8px]">⌄</span>
      </button>
      {open && (
        <div className={`language-switcher-menu ${mobile ? "relative mt-2 grid grid-cols-2 gap-px bg-white/10" : "absolute right-0 top-[calc(100%+8px)] z-[100] w-48 border border-white/15 p-1 shadow-2xl backdrop-blur-xl"}`}>
          {locales.map((targetLocale) => (
            <a
              key={targetLocale}
              href={hrefFor(targetLocale)}
              hrefLang={targetLocale}
              onClick={() => choose(targetLocale)}
              className={`language-switcher-item ${mobile ? "px-4 py-3" : "block px-4 py-3"} text-[11px] font-normal uppercase tracking-[0.13em] transition ${targetLocale === currentLocale ? "text-white" : "text-white/58"}`}
            >
              {localeNames[targetLocale]}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
