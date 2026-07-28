import type {MetadataRoute} from "next";
import {getProjectSlug, projects} from "@/data/projects";
import {routing} from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://arzmimarlik.net";
  const currentDate = new Date();
  const staticPaths = {tr:["", "/hakkimizda", "/projeler", "/iletisim"], en:["", "/about", "/projects", "/contact"]} as const;

  const staticPages: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    staticPaths[locale].map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: currentDate,
      changeFrequency: path === "/projects" ? "monthly" as const : "yearly" as const,
      priority: path === "" ? 1 : path === "/projects" ? 0.9 : 0.8,
      alternates: {
        languages: {
          tr: `${siteUrl}/tr${path === "/about" ? "/hakkimizda" : path === "/projects" ? "/projeler" : path === "/contact" ? "/iletisim" : path}`,
          en: `${siteUrl}/en${path === "/hakkimizda" ? "/about" : path === "/projeler" ? "/projects" : path === "/iletisim" ? "/contact" : path}`,
        },
      },
    })),
  );

  const projectPages: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    projects.map((project) => ({
      url: `${siteUrl}/${locale}/${locale === "tr" ? "projeler" : "projects"}/${getProjectSlug(project, locale)}`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.7,
      alternates: {
        languages: {
          tr: `${siteUrl}/tr/projeler/${getProjectSlug(project, "tr")}`,
          en: `${siteUrl}/en/projects/${getProjectSlug(project, "en")}`,
        },
      },
    })),
  );

  return [...staticPages, ...projectPages];
}
