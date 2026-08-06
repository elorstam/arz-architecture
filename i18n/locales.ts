export const locales = ["tr", "en", "de", "fr", "es", "nl", "ja", "zh", "ko", "ar"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "tr";

export const translationLocales = locales.filter(
  (locale): locale is Exclude<AppLocale, "tr"> => locale !== defaultLocale,
);

export const rtlLocales: AppLocale[] = ["ar"];

export const localeNames: Record<AppLocale, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  nl: "Nederlands",
  ja: "日本語",
  zh: "中文",
  ko: "한국어",
  ar: "العربية",
};

export function isAppLocale(value: string): value is AppLocale {
  return locales.includes(value as AppLocale);
}

export function usesEnglishRoutes(locale: string) {
  return locale !== "tr";
}