import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import {projects, projectEnglishSlugs, localizeProject, type Project} from '@/data/projects';
import {isSupabaseConfigured, supabaseDelete, supabaseSelect, supabaseUpsert} from '@/lib/supabase-rest';
import type {ProjectSeo} from '@/lib/ai-project';

export type ManagedProject = {
  id: string;
  slugTr: string;
  slugEn: string;
  published: boolean;
  order: number;
  tr: Project;
  en: Project;
  translations?: Record<string, Project>;
  seo?: Record<string, ProjectSeo>;
  updatedAt?: string;
};

type Store = {overrides: Record<string, ManagedProject>; deleted: string[]};
type SupabaseRow = {
  id: string;
  slug_tr: string;
  slug_en: string;
  published: boolean;
  sort_order: number;
  translations: Record<string, Project>;
  seo?: Record<string, ProjectSeo>;
  updated_at?: string;
};

const file = path.join(process.cwd(), 'data', 'admin-projects.json');

async function readStore(): Promise<Store> {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch { return {overrides: {}, deleted: []}; }
}
async function writeStore(store: Store) {
  await fs.writeFile(file, JSON.stringify(store, null, 2), 'utf8');
}
function fromStatic(project: Project, index: number): ManagedProject {
  const en = localizeProject(project, 'en');
  return {
    id: project.slug,
    slugTr: project.slug,
    slugEn: projectEnglishSlugs[project.slug] ?? project.slug,
    published: true,
    order: index,
    tr: project,
    en,
    translations: {tr: project, en},
  };
}
function fromRow(row: SupabaseRow): ManagedProject {
  const tr = row.translations?.tr;
  const en = row.translations?.en || tr;
  return {
    id: row.id,
    slugTr: row.slug_tr,
    slugEn: row.slug_en,
    published: row.published,
    order: row.sort_order,
    tr,
    en,
    translations: row.translations,
    seo: row.seo,
    updatedAt: row.updated_at,
  };
}
function toRow(project: ManagedProject): SupabaseRow {
  return {
    id: project.id,
    slug_tr: project.slugTr,
    slug_en: project.slugEn,
    published: project.published,
    sort_order: project.order,
    translations: {...project.translations, tr: project.tr, en: project.en},
    seo: project.seo,
  };
}

export async function getManagedProjects(): Promise<ManagedProject[]> {
  if (isSupabaseConfigured()) {
    const rows = await supabaseSelect<SupabaseRow>('projects', 'select=*&order=sort_order.asc');
    if (rows.length) return rows.map(fromRow);
  }
  const store = await readStore();
  const base = projects.map(fromStatic).filter((p) => !store.deleted.includes(p.id));
  const map = new Map(base.map((p) => [p.id, p]));
  Object.values(store.overrides).forEach((p) => map.set(p.id, p));
  return [...map.values()].sort((a, b) => a.order - b.order);
}

export async function getLocalizedStoreProjects(locale: string) {
  return (await getManagedProjects())
    .filter((p) => p.published)
    .map((p) => {
      const translated = p.translations?.[locale] || p.tr;
      return {...translated, slug: translated.slug || (locale === 'tr' ? p.slugTr : p.slugEn)};
    });
}
export async function getManagedBySlug(slug: string) {
  return (await getManagedProjects()).find((p) => p.slugTr === slug || p.slugEn === slug || Object.values(p.translations || {}).some((translation) => translation.slug === slug));
}
export async function saveManagedProject(project: ManagedProject) {
  const normalized = {...project, updatedAt: new Date().toISOString(), translations: {...project.translations, tr: project.tr, en: project.en}};
  if (isSupabaseConfigured()) {
    await supabaseUpsert('projects', toRow(normalized));
    return normalized;
  }
  const store = await readStore();
  store.overrides[project.id] = normalized;
  store.deleted = store.deleted.filter((id) => id !== project.id);
  await writeStore(store);
  return normalized;
}
export async function deleteManagedProject(id: string) {
  if (isSupabaseConfigured()) {
    await supabaseDelete('projects', `id=eq.${encodeURIComponent(id)}`);
    return;
  }
  const store = await readStore();
  delete store.overrides[id];
  if (!store.deleted.includes(id)) store.deleted.push(id);
  await writeStore(store);
}
