"use client";

import {useEffect} from "react";
import {useLocale} from "next-intl";

type Locale = "tr" | "en";

export default function LocalePreference() {
  const locale = useLocale() as Locale;

  useEffect(() => {
    if (locale !== "tr" && locale !== "en") return;

    window.localStorage.setItem("arz-locale", locale);
    document.cookie = `arz-locale=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, [locale]);

  return null;
}
