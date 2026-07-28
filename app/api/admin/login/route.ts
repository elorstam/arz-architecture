import {NextResponse} from 'next/server';
import {setAdminSession, validPassword} from '@/lib/admin-auth';
import {enableTwoFactor, ensureSecurityState, otpauthUri, verifyTotp} from '@/lib/totp';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const password = String(body.password || '');
  const code = String(body.code || '').replace(/\s/g, '');

  if (!validPassword(password)) {
    return NextResponse.json({error: 'Hatalı şifre'}, {status: 401});
  }

  const security = await ensureSecurityState();
  if (!security.enabled) {
    if (!code) {
      return NextResponse.json({
        requiresSetup: true,
        secret: security.secret,
        otpauthUri: otpauthUri(security.secret)
      });
    }
    if (!verifyTotp(security.secret, code)) {
      return NextResponse.json({error: 'Authenticator kodu geçersiz'}, {status: 401});
    }
    await enableTwoFactor(security.secret);
    await setAdminSession();
    return NextResponse.json({ok: true, setupComplete: true});
  }

  if (!code) return NextResponse.json({requiresTwoFactor: true});
  if (!verifyTotp(security.secret, code)) {
    return NextResponse.json({error: 'Authenticator kodu geçersiz'}, {status: 401});
  }
  await setAdminSession();
  return NextResponse.json({ok: true});
}
