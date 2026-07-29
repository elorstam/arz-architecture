import fs from 'node:fs';
import path from 'node:path';
import {projects, localizeProject, projectEnglishSlugs, type Project} from '../data/projects.ts';

function loadEnvFile(filename: string) {
  const fullPath = path.join(process.cwd(), filename);
  if (!fs.existsSync(fullPath)) return;
  for (const line of fs.readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

function seoFor(project: Project) {
  return {
    metaTitle: project.title,
    metaDescription: project.description.slice(0, 160),
    keywords: [project.category, project.location, ...project.services].filter(Boolean),
    openGraphDescription: project.description,
  };
}

async function main() {
  loadEnvFile('.env.local');
  loadEnvFile('.env');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.');

  const rows = projects.map((tr, order) => {
    const en = localizeProject(tr, 'en');
    return {
      id: tr.slug,
      slug_tr: tr.slug,
      slug_en: projectEnglishSlugs[tr.slug] || en.slug || tr.slug,
      published: true,
      featured: order === 0,
      sort_order: order,
      category: tr.category,
      year: tr.year,
      location: tr.location,
      gallery: tr.images,
      translations: {tr, en},
      seo: {tr: seoFor(tr), en: seoFor(en)},
    };
  });

  const response = await fetch(`${url}/rest/v1/projects?on_conflict=slug_tr`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  });
  if (!response.ok) throw new Error(`Supabase migration başarısız (${response.status}): ${await response.text()}`);
  const migrated = await response.json() as Array<{slug_tr: string}>;
  console.log(`${migrated.length} proje Supabase'e aktarıldı/güncellendi.`);
  for (const row of migrated) console.log(`- ${row.slug_tr}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
