import {defineRouting} from "next-intl/routing";
import {defaultLocale, locales} from "./locales";

const englishLocales = locales.filter((locale) => locale !== "tr");

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  pathnames: {
    "/": "/",
    "/about": Object.fromEntries(locales.map((locale) => [locale, locale === "tr" ? "/hakkimizda" : "/about"])) as Record<(typeof locales)[number], string>,
    "/projects": Object.fromEntries(locales.map((locale) => [locale, locale === "tr" ? "/projeler" : "/projects"])) as Record<(typeof locales)[number], string>,
    "/projects/[slug]": Object.fromEntries(locales.map((locale) => [locale, locale === "tr" ? "/projeler/[slug]" : "/projects/[slug]"])) as Record<(typeof locales)[number], string>,
    "/contact": Object.fromEntries(locales.map((locale) => [locale, locale === "tr" ? "/iletisim" : "/contact"])) as Record<(typeof locales)[number], string>,
  },
});

void englishLocales;
