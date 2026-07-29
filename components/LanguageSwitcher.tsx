"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { getProjectBySlug, getProjectSlug } from "@/data/projects";
import {
  isAppLocale,
  localeNames,
  locales,
  type AppLocale,
} from "@/i18n/locales";
import {navbarSurfaceData, type NavbarSurfaceState} from "@/lib/navbar-surface";
import {navControlClasses} from "@/lib/nav-control";

type Props = {
  mobile?: boolean;
  surfaceState: NavbarSurfaceState;
  onNavigate?: () => void;
};

export default function LanguageSwitcher({
  mobile = false,
  surfaceState,
  onNavigate,
}: Props) {
  const localeValue = useLocale();
  const t = useTranslations("CMS");
  const currentLocale: AppLocale = isAppLocale(localeValue) ? localeValue : "tr";
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, []);

  function hrefFor(targetLocale: AppLocale) {
    const localePattern = new RegExp(`^/(${locales.join("|")})(?=/|$)`);
    const pathWithoutLocale = pathname.replace(localePattern, "") || "/";
    const segments = pathWithoutLocale.split("/").filter(Boolean);
    const routeMap: Record<string, string> =
      targetLocale === "tr"
        ? {
            about: "hakkimizda",
            projects: "projeler",
            contact: "iletisim",
            hakkimizda: "hakkimizda",
            projeler: "projeler",
            iletisim: "iletisim",
          }
        : {
            about: "about",
            projects: "projects",
            contact: "contact",
            hakkimizda: "about",
            projeler: "projects",
            iletisim: "contact",
          };

    if (segments[0]) segments[0] = routeMap[segments[0]] ?? segments[0];

    const isProjectDetail =
      (pathWithoutLocale.startsWith("/projeler/") ||
        pathWithoutLocale.startsWith("/projects/")) &&
      Boolean(segments[1]);
    if (isProjectDetail) {
      const project = getProjectBySlug(segments[1]);
      if (project) {
        segments[1] = getProjectSlug(project, targetLocale === "tr" ? "tr" : "en");
      }
    }

    return `/${targetLocale}${segments.length ? `/${segments.join("/")}` : ""}`;
  }

  return (
    <div
      ref={rootRef}
      className={`language-switcher ${mobile ? "language-switcher--mobile" : ""}`}
      {...navbarSurfaceData(surfaceState)}
      dir="ltr"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("language.label")}
        className={navControlClasses("language-switcher__trigger min-w-[5.75rem] px-3")}
      >
        <span dir={currentLocale === "ar" ? "rtl" : "ltr"}>
          {localeNames[currentLocale]}
        </span>
        <span aria-hidden="true" className="language-switcher__chevron">⌄</span>
      </button>

      {open && (
        <div role="menu" className="language-switcher__menu">
          {locales.map((locale) => (
            <a
              role="menuitem"
              aria-current={locale === currentLocale ? "page" : undefined}
              key={locale}
              href={hrefFor(locale)}
              hrefLang={locale}
              dir={locale === "ar" ? "rtl" : "ltr"}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className={`language-switcher__item ${
                locale === currentLocale ? "is-active" : ""
              }`}
            >
              {localeNames[locale]}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
