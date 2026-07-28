import type {MetadataRoute} from "next";
import {getProjectSlug, projects} from "@/data/projects";
import {routing} from "@/i18n/routing";

const siteUrl = "https://arzmimarlik.net";

function localizedStaticPath(locale: string, key: "home" | "about" | "projects" | "contact") {
  if (key === "home") return "";
  if (locale === "tr") return {about: "/hakkimizda", projects: "/projeler", contact: "/iletisim"}[key];
  return {about: "/about", projects: "/projects", contact: "/contact"}[key];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();
  const keys = ["home", "about", "projects", "contact"] as const;

  const staticPages: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    keys.map((key) => ({
      url: `${siteUrl}/${locale}${localizedStaticPath(locale, key)}`,
      lastModified: currentDate,
      changeFrequency: key === "projects" ? "monthly" as const : "yearly" as const,
      priority: key === "home" ? 1 : key === "projects" ? 0.9 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((alternateLocale) => [alternateLocale, `${siteUrl}/${alternateLocale}${localizedStaticPath(alternateLocale, key)}`]),
        ),
      },
    })),
  );

  const projectPages: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    projects.map((project) => ({
      url: `${siteUrl}/${locale}/${locale === "tr" ? "projeler" : "projects"}/${getProjectSlug(project, locale === "tr" ? "tr" : "en")}`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((alternateLocale) => [
            alternateLocale,
            `${siteUrl}/${alternateLocale}/${alternateLocale === "tr" ? "projeler" : "projects"}/${getProjectSlug(project, alternateLocale === "tr" ? "tr" : "en")}`,
          ]),
        ),
      },
    })),
  );

  return [...staticPages, ...projectPages];
}
