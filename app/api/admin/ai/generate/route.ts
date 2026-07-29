import {NextResponse} from 'next/server';
import type {Project} from '@/data/projects';
import {isAdmin} from '@/lib/admin-auth';
import {generateTurkishProjectContent, OpenAIRequestError} from '@/lib/ai-project';

export const runtime = 'nodejs';
const attempts = new Map<string, number[]>();

function isRateLimited(request: Request) {
  const key = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'admin';
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 5) return true;
  attempts.set(key, [...recent, now]);
  return false;
}
function isProject(value: unknown): value is Project {
  if (!value || typeof value !== 'object') return false;
  const project = value as Partial<Project>;
  return typeof project.title === 'string' && project.title.trim().length > 1
    && project.title.length <= 200 && typeof project.category === 'string'
    && typeof project.location === 'string' && typeof project.year === 'string'
    && Array.isArray(project.services) && Array.isArray(project.images);
}

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({error: 'Yetkisiz.'}, {status: 401});
  if (isRateLimited(request)) {
    return NextResponse.json({error: 'Çok fazla AI isteği gönderildi. Bir dakika sonra tekrar deneyin.'}, {status: 429});
  }
  try {
    const body = await request.json() as {project?: unknown};
    if (!isProject(body.project)) {
      return NextResponse.json({error: 'En az proje başlığı ile geçerli proje bilgileri gerekli.'}, {status: 400});
    }
    return NextResponse.json(await generateTurkishProjectContent(body.project));
  } catch (error) {
    if (error instanceof OpenAIRequestError) {
      console.error('OpenAI content generation failed', {status: error.status, message: error.message, detail: error.detail});
      return NextResponse.json({error: error.message, openaiStatus: error.status}, {status: error.status === 504 ? 504 : 502});
    }
    const message = error instanceof Error ? error.message : 'AI üretimi tamamlanamadı.';
    console.error('Project AI generation failed', {status: 500, message});
    return NextResponse.json({error: message}, {status: 502});
  }
}
