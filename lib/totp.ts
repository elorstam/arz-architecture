import 'server-only';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const securityFile = path.join(process.cwd(), 'data', 'admin-security.json');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

type SecurityState = {secret: string; enabled: boolean; createdAt: string};

function base32Encode(buffer: Buffer) {
  let bits = '';
  for (const byte of buffer) bits += byte.toString(2).padStart(8, '0');
  let output = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    output += alphabet[parseInt(chunk, 2)];
  }
  return output;
}

function base32Decode(input: string) {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (const char of clean) {
    const index = alphabet.indexOf(char);
    if (index < 0) throw new Error('Geçersiz TOTP anahtarı');
    bits += index.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function hotp(secret: string, counter: number) {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = crypto.createHmac('sha1', base32Decode(secret)).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, '0');
}

export function verifyTotp(secret: string, code: string) {
  if (!/^\d{6}$/.test(code)) return false;
  const current = Math.floor(Date.now() / 1000 / 30);
  return [-1, 0, 1].some(offset => {
    const expected = hotp(secret, current + offset);
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(code));
  });
}

export async function getSecurityState(): Promise<SecurityState | null> {
  try {
    const parsed = JSON.parse(await fs.readFile(securityFile, 'utf8')) as SecurityState;
    return parsed?.secret ? parsed : null;
  } catch {
    return null;
  }
}

export async function ensureSecurityState() {
  const current = await getSecurityState();
  if (current) return current;
  await fs.mkdir(path.dirname(securityFile), {recursive: true});
  const state: SecurityState = {
    secret: base32Encode(crypto.randomBytes(20)),
    enabled: false,
    createdAt: new Date().toISOString()
  };
  await fs.writeFile(securityFile, JSON.stringify(state, null, 2), {encoding: 'utf8', mode: 0o600});
  return state;
}

export async function enableTwoFactor(secret: string) {
  const state: SecurityState = {secret, enabled: true, createdAt: new Date().toISOString()};
  await fs.writeFile(securityFile, JSON.stringify(state, null, 2), {encoding: 'utf8', mode: 0o600});
}

export function otpauthUri(secret: string) {
  const issuer = encodeURIComponent('ARZ Mimarlık');
  const account = encodeURIComponent('admin');
  return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}
