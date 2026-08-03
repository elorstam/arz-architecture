import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("migration 021 creates a private, organization-scoped thumbnail cache", async () => {
  const sql = await read("supabase/migrations/021_thumbnail_cache.sql");
  assert.match(sql, /create table if not exists public\.studio_file_thumbnails/i);
  assert.match(sql, /values\('studio-thumbnails','studio-thumbnails',false/i);
  assert.match(sql, /unique\(file_version_id\)/i);
  assert.match(sql, /status in\('pending','generating','ready','failed','unsupported'\)/i);
  assert.match(sql, /studio_is_organization_member\(organization_id\)/i);
  assert.match(sql, /studio_has_organization_role\(organization_id,array\['owner'\]\)/i);
  assert.doesNotMatch(sql, /for delete/i);
  assert.match(sql, /revoke delete/i);
});

test("migration backfills ready versions as pending without deleting historical thumbnails", async () => {
  const [sql, rollback] = await Promise.all([
    read("supabase/migrations/021_thumbnail_cache.sql"),
    read("supabase/rollbacks/021_thumbnail_cache.rollback.sql"),
  ]);
  assert.match(sql, /from public\.studio_project_file_versions v\s+where v\.status='ready'/i);
  assert.match(sql, /on conflict\(file_version_id\) do nothing/i);
  assert.doesNotMatch(sql, /delete from public\.studio_file_thumbnails/i);
  assert.match(rollback, /private bucket and its objects are deliberately retained/i);
});

test("supported image and PDF types use server-side Drive thumbnail generation", async () => {
  const [types, repository, provider] = await Promise.all([
    read("lib/studio/files/thumbnails/thumbnail-types.ts"),
    read("lib/studio/files/thumbnails/thumbnail-repository.ts"),
    read("lib/studio/files/storage/google-drive-provider.ts"),
  ]);
  for (const mime of ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "application/pdf"]) assert.match(types, new RegExp(mime.replace("+", "\\+")));
  assert.match(provider, /thumbnailLink/);
  assert.match(provider, /hostname\.endsWith\("\.googleusercontent\.com"\)/);
  assert.match(provider, /redirect:"error"/);
  assert.match(repository, /downloadDriveThumbnail/);
  assert.match(repository, /studio-thumbnails/);
  assert.doesNotMatch(repository, /createSignedUrl|getPublicUrl|anyone/i);
});

test("thumbnail route remains authenticated and never exposes a provider URL", async () => {
  const route = await read("app/studio/(protected)/projects/[projectId]/files/[fileId]/thumbnail/route.ts");
  assert.match(route, /getStudioThumbnail/);
  assert.match(route, /downloadCachedStudioThumbnail/);
  assert.match(route, /"Cache-Control":\s*"private/);
  assert.match(route, /"Referrer-Policy":\s*"no-referrer/);
  assert.doesNotMatch(route, /thumbnailLink|access_token|drive\.google\.com/);
});

test("new and recovered versions regenerate cache without overwriting old objects", async () => {
  const [actions, repository] = await Promise.all([
    read("app/studio/(protected)/projects/[projectId]/files/actions.ts"),
    read("lib/studio/files/thumbnails/thumbnail-repository.ts"),
  ]);
  assert.match(actions, /finalizeFileVersionUploadAction[\s\S]*regenerateStudioThumbnail/);
  assert.match(actions, /recoverFileVersionUploadAction[\s\S]*regenerateStudioThumbnail/);
  assert.match(actions, /promoteFileVersionAction[\s\S]*regenerateCurrentStudioThumbnail/);
  assert.match(repository, /crypto\.randomUUID\(\)/);
  assert.match(repository, /upsert:false/);
  assert.doesNotMatch(repository, /storage[\s\S]{0,80}\.remove\(/);
});

test("visual browser persists grid/list preference and shows safe quick actions", async () => {
  const browser = await read("components/studio/files/StudioVisualFileBrowser.tsx");
  assert.match(browser, /arz-studio-file-view/);
  assert.match(browser, /localStorage\.getItem/);
  assert.match(browser, /localStorage\.setItem/);
  assert.match(browser, /aria-pressed/);
  assert.match(browser, /Thumbnail yükleniyor/);
  assert.match(browser, /DWG Çizimi/);
  assert.match(browser, /SketchUp Modeli/);
  assert.match(browser, /BIM Modeli/);
  assert.match(browser, /Paylaşım kapalı/);
});

test("search and quick access reuse authenticated thumbnail routes", async () => {
  const [fileProvider, versionProvider, searchItem, quickCard] = await Promise.all([
    read("lib/studio/search/providers/file-provider.ts"),
    read("lib/studio/search/providers/file-version-provider.ts"),
    read("components/studio/search/StudioSearchItem.tsx"),
    read("components/studio/quick-access/StudioQuickAccessCard.tsx"),
  ]);
  assert.match(fileProvider, /\/thumbnail/);
  assert.match(versionProvider, /\/thumbnail\?version=/);
  assert.match(searchItem, /thumbnailUrl/);
  assert.match(quickCard, /thumbnail/);
  assert.doesNotMatch(`${fileProvider}${versionProvider}${quickCard}`, /https?:\/\//);
});

test("render archive foundation only reports supported ready previews", async () => {
  const types = await read("lib/studio/files/thumbnails/thumbnail-types.ts");
  assert.match(types, /category==="render"&&supportsStudioThumbnail\(mimeType\)&&status==="ready"/);
});
