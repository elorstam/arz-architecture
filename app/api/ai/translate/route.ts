import {NextResponse} from 'next/server';
import {isAdmin} from '@/lib/admin-auth';
import type {Project} from '@/data/projects';

const localeNames: Record<string, string> = {
  tr: 'Turkish', en: 'English', de: 'German', fr: 'French', es: 'Spanish',
  nl: 'Dutch', ar: 'Arabic', ja: 'Japanese', ko: 'Korean', zh: 'Simplified Chinese',
};

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({error: 'Yetkisiz'}, {status: 401});
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({error: 'OPENAI_API_KEY tanımlı değil'}, {status: 503});

  const {project, targetLocale} = await request.json() as {project?: Project; targetLocale?: string};
  if (!project || !targetLocale || !localeNames[targetLocale]) {
    return NextResponse.json({error: 'Geçersiz proje veya hedef dil'}, {status: 400});
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`},
    body: JSON.stringify({
      model: process.env.OPENAI_TRANSLATION_MODEL || 'gpt-5-mini',
      input: [
        {role: 'system', content: `You translate architecture portfolio content into ${localeNames[targetLocale]}. Return only valid JSON. Preserve image paths, year values and the exact object shape. Translate title, titleLines, category, location, services, coverAlt, description, detailParagraphs and image alt texts. Keep brand and proper project names natural.`},
        {role: 'user', content: JSON.stringify(project)},
      ],
      text: {format: {type: 'json_object'}},
    }),
  });
  if (!response.ok) return NextResponse.json({error: await response.text()}, {status: 502});
  const data = await response.json() as {
    output_text?: string;
    output?: Array<{content?: Array<{type?: string; text?: string}>}>;
  };
  const text = data.output_text || data.output?.flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text;
  if (!text) return NextResponse.json({error: 'AI yanıtı boş geldi'}, {status: 502});
  return NextResponse.json({translation: JSON.parse(text)});
}
