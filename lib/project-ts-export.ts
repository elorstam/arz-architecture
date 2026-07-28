import 'server-only';
import type {ManagedProject} from '@/lib/project-store';
import type {Project} from '@/data/projects';

function serialize(value: unknown) {
  return JSON.stringify(value, null, 2)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function normalizedProject(project: Project, slug: string): Project {
  return {
    ...project,
    slug,
    titleLines: Array.isArray(project.titleLines) ? project.titleLines : [],
    services: Array.isArray(project.services) ? project.services : [],
    detailParagraphs: Array.isArray(project.detailParagraphs) ? project.detailParagraphs : [],
    images: Array.isArray(project.images) ? project.images : [],
  };
}

/**
 * Admin panelindeki güncel projelerden, mevcut data/projects.ts API'siyle
 * uyumlu ve doğrudan projeye kopyalanabilir bir TypeScript dosyası üretir.
 */
export function generateProjectsTs(managedProjects: ManagedProject[]) {
  const published = managedProjects
    .filter((item) => item.published)
    .sort((a, b) => a.order - b.order);

  const turkishProjects = published.map((item) =>
    normalizedProject(item.tr, item.slugTr || item.tr.slug),
  );

  const englishSlugs = Object.fromEntries(
    published.map((item) => [item.slugTr || item.tr.slug, item.slugEn || item.en.slug]),
  );

  const englishProjects = Object.fromEntries(
    published.map((item) => {
      const turkishSlug = item.slugTr || item.tr.slug;
      const english = normalizedProject(item.en, item.slugEn || item.en.slug);
      const localizedFields: Partial<Project> = {...english};
      delete localizedFields.slug;
      return [turkishSlug, localizedFields];
    }),
  );

  return `// Bu dosya ARZ Admin Paneli tarafından yedek alınırken otomatik oluşturuldu.\n// Elle düzenlerseniz bir sonraki tam yedekte admin panelindeki veriler esas alınır.\n\nexport type ProjectImage = {\n  src: string;\n  alt: string;\n  contain?: boolean;\n};\n\nexport type Project = {\n  slug: string;\n  title: string;\n  titleLines: string[];\n  category: string;\n  location: string;\n  year: string;\n  services: string[];\n  cover: string;\n  coverAlt: string;\n  description: string;\n  detailParagraphs: string[];\n  images: ProjectImage[];\n};\n\nexport const projects: Project[] = ${serialize(turkishProjects)};\n\nexport const projectEnglishSlugs: Record<string, string> = ${serialize(englishSlugs)};\n\nexport function getProjectSlug(project: Project, locale: string) {\n  return locale === \"en\" ? (projectEnglishSlugs[project.slug] ?? project.slug) : project.slug;\n}\n\nexport function getTurkishSlug(slug: string) {\n  return Object.entries(projectEnglishSlugs).find(([, englishSlug]) => englishSlug === slug)?.[0] ?? slug;\n}\n\nconst projectEnglish: Record<string, Partial<Project>> = ${serialize(englishProjects)};\n\nexport function localizeProject(project: Project, locale: string): Project {\n  return locale === \"en\"\n    ? {...project, ...projectEnglish[project.slug], slug: getProjectSlug(project, locale)}\n    : project;\n}\n\nexport function getLocalizedProjects(locale: string): Project[] {\n  return projects.map((project) => localizeProject(project, locale));\n}\n\nexport function getProjectBySlug(slug: string) {\n  const turkishSlug = getTurkishSlug(slug);\n  return projects.find((project) => project.slug === turkishSlug);\n}\n`;
}
