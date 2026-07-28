"use client";

import {useEffect} from "react";
import {useLocale} from "next-intl";
import {isAppLocale} from "@/i18n/locales";

export default function LocalePreference() {
  const locale = useLocale();
  useEffect(() => {
    if (!isAppLocale(locale)) return;
    window.localStorage.setItem("arz-locale", locale);
    document.cookie = `arz-locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}
