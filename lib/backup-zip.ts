import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import {getManagedProjects} from '@/lib/project-store';
import {generateProjectsTs} from '@/lib/project-ts-export';

type Entry = {name: string; data: Buffer};

const table = (() => {
  const values = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    values[n] = c >>> 0;
  }
  return values;
})();

function crc32(data: Buffer) {
  let crc = 0xffffffff;
  for (const byte of data) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return {time, day};
}

export function createZip(entries: Entry[]) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  const stamp = dosDateTime();

  for (const entry of entries) {
    const name = Buffer.from(entry.name.replace(/\\/g, '/'));
    const checksum = crc32(entry.data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(stamp.time, 10);
    local.writeUInt16LE(stamp.day, 12);
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(entry.data.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, entry.data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(stamp.time, 12);
    central.writeUInt16LE(stamp.day, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(entry.data.length, 20);
    central.writeUInt32LE(entry.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + entry.data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

export function parseZip(buffer: Buffer) {
  const entries: Entry[] = [];
  let offset = 0;
  while (offset + 4 <= buffer.length && buffer.readUInt32LE(offset) === 0x04034b50) {
    if (offset + 30 > buffer.length) throw new Error('Bozuk ZIP başlığı');
    const flags = buffer.readUInt16LE(offset + 6);
    const method = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const uncompressedSize = buffer.readUInt32LE(offset + 22);
    const nameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    if (flags & 0x0008) throw new Error('Data descriptor içeren ZIP desteklenmiyor');
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const dataEnd = dataStart + compressedSize;
    if (dataEnd > buffer.length) throw new Error('Eksik ZIP verisi');
    const name = buffer.subarray(nameStart, nameStart + nameLength).toString('utf8');
    const compressed = buffer.subarray(dataStart, dataEnd);
    let data: Buffer;
    if (method === 0) data = Buffer.from(compressed);
    else if (method === 8) data = zlib.inflateRawSync(compressed);
    else throw new Error(`Desteklenmeyen ZIP sıkıştırması: ${method}`);
    if (data.length !== uncompressedSize) throw new Error('ZIP boyut doğrulaması başarısız');
    entries.push({name, data});
    offset = dataEnd;
  }
  if (!entries.length) throw new Error('ZIP içinde dosya bulunamadı');
  return entries;
}

async function collectFiles(dir: string, prefix: string): Promise<Entry[]> {
  try {
    const dirents = await fs.readdir(dir, {withFileTypes: true});
    const output: Entry[] = [];
    for (const item of dirents) {
      const absolute = path.join(dir, item.name);
      const relative = `${prefix}/${item.name}`;
      if (item.isDirectory()) output.push(...await collectFiles(absolute, relative));
      else if (item.isFile()) output.push({name: relative, data: await fs.readFile(absolute)});
    }
    return output;
  } catch {
    return [];
  }
}

function isImageFile(name: string) {
  return /\.(avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(name);
}

export async function buildBackup() {
  const entries: Entry[] = [];
  const projectFile = path.join(process.cwd(), 'data', 'admin-projects.json');
  const securityFile = path.join(process.cwd(), 'data', 'admin-security.json');

  try { entries.push({name: 'data/admin-projects.json', data: await fs.readFile(projectFile)}); } catch {}
  try { entries.push({name: 'data/admin-security.json', data: await fs.readFile(securityFile)}); } catch {}

  // Admin panelindeki güncel, yayındaki projelerden kod tarafında doğrudan
  // kullanılabilen data/projects.ts anlık görüntüsü oluşturulur.
  const managedProjects = await getManagedProjects();
  const publishedProjectCount = managedProjects.filter(project => project.published).length;
  entries.push({
    name: 'data/projects.ts',
    data: Buffer.from(generateProjectsTs(managedProjects), 'utf8')
  });

  // Yeni sistem: admin panelinden yüklenen ve mevcut tüm proje görselleri.
  entries.push(...await collectFiles(path.join(process.cwd(), 'public', 'images'), 'public/images'));

  // Önceki sürümden kalan yüklemeleri kaybetmemek için eski klasör de yedeklenir.
  entries.push(...await collectFiles(path.join(process.cwd(), 'public', 'uploads', 'projects'), 'public/uploads/projects'));

  const projectCount = managedProjects.length;
  const imageCount = entries.filter(entry =>
    (entry.name.startsWith('public/images/') || entry.name.startsWith('public/uploads/projects/')) && isImageFile(entry.name)
  ).length;

  const manifest = {
    version: 3,
    createdAt: new Date().toISOString(),
    projectCount,
    publishedProjectCount,
    imageCount,
    fileCount: entries.length + 1,
    includedPaths: [
      'data/admin-projects.json',
      'data/admin-security.json',
      'data/projects.ts (admin panelinden otomatik üretilir)',
      'public/images/**',
      'public/uploads/projects/** (legacy)'
    ]
  };

  entries.unshift({
    name: 'backup-manifest.json',
    data: Buffer.from(JSON.stringify(manifest, null, 2))
  });

  return createZip(entries);
}

export async function restoreBackup(buffer: Buffer) {
  if (buffer.length > 750 * 1024 * 1024) throw new Error('Yedek dosyası 750 MB sınırını aşıyor');

  const entries = parseZip(buffer);
  const allowed = entries.filter(entry =>
    entry.name === 'data/admin-projects.json' ||
    entry.name === 'data/admin-security.json' ||
    entry.name === 'data/projects.ts' ||
    entry.name === 'backup-manifest.json' ||
    entry.name.startsWith('public/images/') ||
    entry.name.startsWith('public/uploads/projects/')
  );

  if (!allowed.some(entry => entry.name === 'data/admin-projects.json')) {
    throw new Error('Yedekte proje verisi bulunamadı');
  }

  const total = allowed.reduce((sum, entry) => sum + entry.data.length, 0);
  if (total > 1500 * 1024 * 1024) throw new Error('Açılmış yedek boyutu çok büyük');

  // Yedekte ilgili görsel klasörü varsa, mevcut klasörü önce temizleyerek birebir geri yükle.
  if (allowed.some(entry => entry.name.startsWith('public/images/'))) {
    await fs.rm(path.join(process.cwd(), 'public', 'images'), {recursive: true, force: true});
  }
  if (allowed.some(entry => entry.name.startsWith('public/uploads/projects/'))) {
    await fs.rm(path.join(process.cwd(), 'public', 'uploads', 'projects'), {recursive: true, force: true});
  }

  for (const entry of allowed) {
    if (entry.name === 'backup-manifest.json') continue;

    const safeName = entry.name.replace(/\\/g, '/');
    if (safeName.includes('..') || safeName.startsWith('/')) throw new Error('Güvensiz dosya yolu');

    const destination = path.join(process.cwd(), ...safeName.split('/'));
    const relative = path.relative(process.cwd(), destination);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Güvensiz hedef yolu');

    await fs.mkdir(path.dirname(destination), {recursive: true});
    await fs.writeFile(destination, entry.data);
  }

  const projectEntry = allowed.find(entry => entry.name === 'data/admin-projects.json');
  let projects = 0;
  if (projectEntry) {
    try {
      const parsed = JSON.parse(projectEntry.data.toString('utf8'));
      if (Array.isArray(parsed)) projects = parsed.length;
      else if (parsed && typeof parsed === 'object' && parsed.overrides) {
        projects = Object.keys(parsed.overrides).length;
      }
    } catch {}
  }

  const images = allowed.filter(entry =>
    (entry.name.startsWith('public/images/') || entry.name.startsWith('public/uploads/projects/')) && isImageFile(entry.name)
  ).length;
  const restoredFiles = allowed.filter(entry => entry.name !== 'backup-manifest.json').length;

  return {files: restoredFiles, projects, images};
}
