"use client";

import Script from "next/script";
import {useLocale} from "next-intl";
import {useEffect} from "react";

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (
          options: Record<string, unknown>,
          elementId: string,
        ) => unknown;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

const googleLocaleMap: Record<string, string> = {
  de: "de",
  fr: "fr",
  es: "es",
  nl: "nl",
  ja: "ja",
  zh: "zh-CN",
  ko: "ko",
  ar: "ar",
};

function setGoogleCookie(value: string) {
  const expires = value ? "Max-Age=31536000" : "Max-Age=0";
  document.cookie = `googtrans=${value}; Path=/; ${expires}; SameSite=Lax`;

  // The domain cookie is useful in production; localhost rejects it harmlessly.
  if (window.location.hostname.includes(".")) {
    document.cookie = `googtrans=${value}; Path=/; Domain=.${window.location.hostname}; ${expires}; SameSite=Lax`;
  }
}

export default function AutoTranslate() {
  const locale = useLocale();
  const targetLanguage = googleLocaleMap[locale];

  useEffect(() => {
    setGoogleCookie(targetLanguage ? `/en/${targetLanguage}` : "");

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate?.TranslateElement) return;

      const host = document.getElementById("google_translate_element");
      if (!host || host.childNodes.length > 0) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: locale === "tr" ? "tr" : "en",
          includedLanguages: "ar,de,en,es,fr,ja,ko,nl,tr,zh-CN",
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };

    if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }
  }, [locale, targetLanguage]);

  return (
    <>
      <div id="google_translate_element" className="hidden" aria-hidden="true" />
      <Script
        id="google-translate-script"
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
