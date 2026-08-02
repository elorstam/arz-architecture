import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("render archive readiness distinguishes schema, permission and safe states", async () => {
  const [page, helper] = await Promise.all([
    read("app/studio/(protected)/projects/[projectId]/renders/page.tsx"),
    read("lib/studio/renders/render-readiness.ts"),
  ]);
  assert.match(helper, /PGRST205/);
  assert.match(helper, /42P01/);
  assert.match(helper, /42501/);
  assert.match(helper, /STUDIO_RENDER_ARCHIVE_LOAD_ERROR/);
  assert.match(page, /initialize_render_categories/);
  assert.match(page, /load_render_archive/);
  assert.doesNotMatch(page, /Migration 022 uygulandıktan sonra/);
});

test("migration 022 contains the inventory objects and is transactional", async () => {
  const sql = await read("supabase/migrations/022_render_archive.sql");
  for (const relation of ["studio_render_categories", "studio_project_renders", "studio_render_events"]) {
    assert.match(sql, new RegExp(`create table if not exists public\\.${relation}`));
  }
  assert.match(sql, /^begin;/im);
  assert.match(sql, /^commit;/im);
  assert.doesNotMatch(sql, /notify pgrst/i);
});
