import type {MetadataRoute} from 'next';
import {routing} from '@/i18n/routing';
import {getManagedProjects} from '@/lib/project-store';
import {getPosts} from '@/lib/post-store';
import {companyLegalConfig} from '@/lib/legal/company-config';
import {legalSlugs} from '@/lib/legal/legal-content';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://arzmimarlik.net').replace(/\/$/, '');

function staticPath(locale: string, key: 'home' | 'about' | 'projects' | 'blog' | 'contact') {
  if (key === 'home') return '';
  if (locale === 'tr') return {about: '/hakkimizda', projects: '/projeler', blog: '/blog', contact: '/iletisim'}[key];
  return {about: '/about', projects: '/projects', blog: '/blog', contact: '/contact'}[key];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const keys = ['home', 'about', 'projects', 'blog', 'contact'] as const;
  const managed = (await getManagedProjects()).filter((project) => project.published);
  const posts = await getPosts();

  const staticPages = routing.locales.flatMap((locale) => keys.map((key) => ({
    url: `${siteUrl}/${locale}${staticPath(locale, key)}`,
    lastModified: now,
    changeFrequency: key === 'projects' ? 'monthly' as const : 'yearly' as const,
    priority: key === 'home' ? 1 : key === 'projects' ? 0.9 : 0.8,
    alternates: {languages: Object.fromEntries(routing.locales.map((alt) => [alt, `${siteUrl}/${alt}${staticPath(alt, key)}`]))},
  })));

  const projectPages = routing.locales.flatMap((locale) => managed.map((project) => ({
    url: `${siteUrl}/${locale}/${locale === 'tr' ? 'projeler' : 'projects'}/${project.translations?.[locale]?.slug || (locale === 'tr' ? project.slugTr : project.slugEn)}`,
    lastModified: project.updatedAt ? new Date(project.updatedAt) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
    alternates: {languages: Object.fromEntries(routing.locales.map((alt) => [
      alt,
      `${siteUrl}/${alt}/${alt === 'tr' ? 'projeler' : 'projects'}/${project.translations?.[alt]?.slug || (alt === 'tr' ? project.slugTr : project.slugEn)}`,
    ]))},
  })));

  const blogPages = routing.locales.flatMap((locale) =>
    posts.map((post)=>({url:`${siteUrl}/${locale}/blog/${post.slugs[locale]||post.slugs.tr}`,lastModified:post.updatedAt?new Date(post.updatedAt):now,changeFrequency:'monthly' as const,priority:0.7,alternates:{languages:Object.fromEntries(routing.locales.map(alt=>[alt,`${siteUrl}/${alt}/blog/${post.slugs[alt]||post.slugs.tr}`]))}})),
  );
  const legalPages = routing.locales.flatMap((locale) => legalSlugs.map((slug) => ({
    url: `${siteUrl}/${locale}/yasal/${slug}`,
    lastModified: new Date(companyLegalConfig.lastUpdatedAt),
    changeFrequency: 'yearly' as const,
    priority: 0.45,
    alternates: {languages: Object.fromEntries(routing.locales.map((alt) => [alt, `${siteUrl}/${alt}/yasal/${slug}`]))},
  })));
  return [...staticPages, ...projectPages, ...blogPages, ...legalPages];
}
