import {NextResponse} from 'next/server';
import {isAdmin} from '@/lib/admin-auth';
import {isSupabaseConfigured, supabaseUpload} from '@/lib/supabase-rest';
import fs from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({error: 'Yetkisiz'}, {status: 401});

  const form = await req.formData();
  const file = form.get('file');
  const slug = String(form.get('slug') || 'project')
    .replace(/[^a-z0-9-]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'project';

  if (!(file instanceof File)) return NextResponse.json({error: 'Dosya yok'}, {status: 400});
  if (!file.type.startsWith('image/')) return NextResponse.json({error: 'Sadece görsel yüklenebilir'}, {status: 400});
  if (file.size > 25 * 1024 * 1024) return NextResponse.json({error: 'Görsel 25 MB sınırını aşıyor'}, {status: 400});

  const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg';
  const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  if (isSupabaseConfigured()) {
    const bucket = process.env.SUPABASE_PROJECT_IMAGES_BUCKET || 'project-images';
    const url = await supabaseUpload(bucket, `${slug}/${name}`, file);
    return NextResponse.json({url, storage: 'supabase'});
  }

  const dir = path.join(process.cwd(), 'public', 'images', slug);
  await fs.mkdir(dir, {recursive: true});
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({url: `/images/${slug}/${name}`, storage: 'local'});
}
