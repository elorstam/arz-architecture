import {NextResponse} from 'next/server';
import {isAdmin} from '@/lib/admin-auth';
import {buildBackup, restoreBackup} from '@/lib/backup-zip';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({error: 'Yetkisiz'}, {status: 401});
  const zip = await buildBackup();
  const date = new Date().toISOString().replace(/[:.]/g, '-');
  return new NextResponse(new Uint8Array(zip), {
    headers: {
      'content-type': 'application/zip',
      'content-disposition': `attachment; filename="ARZ-Backup-${date}.zip"`,
      'cache-control': 'no-store'
    }
  });
}

export async function POST(req: Request) {
  if (!await isAdmin()) return NextResponse.json({error: 'Yetkisiz'}, {status: 401});
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({error: 'Yedek dosyası seçilmedi'}, {status: 400});
    if (!file.name.toLowerCase().endsWith('.zip')) return NextResponse.json({error: 'Sadece ZIP yedeği yüklenebilir'}, {status: 400});
    const result = await restoreBackup(Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ok: true, ...result});
  } catch (error) {
    return NextResponse.json({error: error instanceof Error ? error.message : 'Yedek geri yüklenemedi'}, {status: 400});
  }
}
