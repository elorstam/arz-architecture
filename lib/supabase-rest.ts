import 'server-only';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(url && serviceKey);
}

function headers(extra?: HeadersInit): HeadersInit {
  return {
    apikey: serviceKey || '',
    Authorization: `Bearer ${serviceKey || ''}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

export async function supabaseSelect<T>(table: string, query = ''): Promise<T[]> {
  if (!url || !serviceKey) return [];
  const response = await fetch(`${url}/rest/v1/${table}?${query}`, {
    headers: headers(),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Supabase select failed: ${await response.text()}`);
  return response.json() as Promise<T[]>;
}

export async function supabaseUpsert<T extends object>(table: string, value: T, conflict = 'id'): Promise<void> {
  if (!url || !serviceKey) throw new Error('Supabase yapılandırılmadı.');
  const response = await fetch(`${url}/rest/v1/${table}?on_conflict=${encodeURIComponent(conflict)}`, {
    method: 'POST',
    headers: headers({Prefer: 'resolution=merge-duplicates,return=minimal'}),
    body: JSON.stringify(value),
  });
  if (!response.ok) throw new Error(`Supabase upsert failed: ${await response.text()}`);
}

export async function supabaseDelete(table: string, filter: string): Promise<void> {
  if (!url || !serviceKey) throw new Error('Supabase yapılandırılmadı.');
  const response = await fetch(`${url}/rest/v1/${table}?${filter}`, {
    method: 'DELETE',
    headers: headers({Prefer: 'return=minimal'}),
  });
  if (!response.ok) throw new Error(`Supabase delete failed: ${await response.text()}`);
}

export async function supabaseInsert<T extends object, R>(table: string, value: T): Promise<R> {
  if (!url || !serviceKey) throw new Error('Supabase yapılandırılmadı.');
  const response = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: headers({Prefer: 'return=representation'}),
    body: JSON.stringify(value),
  });
  if (!response.ok) throw new Error(`Supabase insert failed: ${await response.text()}`);
  const rows = await response.json() as R[];
  return rows[0];
}

export async function supabaseUpload(bucket: string, objectPath: string, file: File): Promise<string> {
  if (!url || !serviceKey) throw new Error('Supabase yapılandırılmadı.');
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${objectPath}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: await file.arrayBuffer(),
  });
  if (!response.ok) throw new Error(`Supabase upload failed: ${await response.text()}`);
  return `${url}/storage/v1/object/public/${bucket}/${objectPath}`;
}

export async function supabaseStorageDelete(bucket: string, objectPaths: string[]): Promise<void> {
  if (!url || !serviceKey) throw new Error('Supabase yapılandırılmadı.');
  const response = await fetch(`${url}/storage/v1/object/${bucket}`, {
    method: 'DELETE',
    headers: headers(),
    body: JSON.stringify({prefixes: objectPaths}),
  });
  if (!response.ok) throw new Error(`Supabase storage delete failed: ${await response.text()}`);
}
