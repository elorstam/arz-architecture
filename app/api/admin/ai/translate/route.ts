import {NextResponse} from 'next/server';
import type {Project} from '@/data/projects';
import {generateProjectTranslations, OpenAIRequestError, translationLocales, type ProjectSeo, type TranslationLocale} from '@/lib/ai-project';
import {isAdmin} from '@/lib/admin-auth';

export const runtime = 'nodejs';

function isProject(value: unknown): value is Project {
  if (!value || typeof value !== 'object') return false;
  const project = value as Partial<Project>;
  return typeof project.title === 'string' && project.title.trim().length > 1
    && typeof project.description === 'string' && Array.isArray(project.services)
    && Array.isArray(project.detailParagraphs) && Array.isArray(project.images);
}
function isSeo(value: unknown): value is ProjectSeo {
  if (!value || typeof value !== 'object') return false;
  const seo = value as Partial<ProjectSeo>;
  return typeof seo.metaTitle === 'string' && typeof seo.metaDescription === 'string'
    && Array.isArray(seo.keywords) && typeof seo.openGraphDescription === 'string';
}

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({error: 'Yetkisiz.'}, {status: 401});
  try {
    const body = await request.json() as {project?: unknown; seo?: unknown; locales?: unknown};
    if (!isProject(body.project) || !isSeo(body.seo)) {
      return NextResponse.json({error: 'Çeviri için tamamlanmış Türkçe içerik ve SEO bilgileri gerekli.'}, {status: 400});
    }
    if (!Array.isArray(body.locales) || body.locales.length < 1 || body.locales.length > 3
      || !body.locales.every((locale): locale is TranslationLocale => typeof locale === 'string' && translationLocales.includes(locale as TranslationLocale))) {
      return NextResponse.json({error: 'Her istek 1-3 desteklenen çeviri dili içermelidir.'}, {status: 400});
    }
    return NextResponse.json(await generateProjectTranslations(body.project, body.seo, body.locales));
  } catch (error) {
    if (error instanceof OpenAIRequestError) {
      console.error('OpenAI translation generation failed', {status: error.status, message: error.message, detail: error.detail});
      return NextResponse.json({error: error.message, openaiStatus: error.status}, {status: error.status === 504 ? 504 : 502});
    }
    const message = error instanceof Error ? error.message : 'Çeviriler oluşturulamadı.';
    console.error('Project translation generation failed', {status: 500, message});
    return NextResponse.json({error: message}, {status: 502});
  }
}
