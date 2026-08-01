import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const migration = await readFile(new URL("../../supabase/migrations/007_fix_google_drive_connection_rls.sql", import.meta.url), "utf8");
const rollback = await readFile(new URL("../../supabase/migrations/007_fix_google_drive_connection_rls.rollback.sql", import.meta.url), "utf8");
const foundation = await readFile(new URL("../../supabase/migrations/001_studio_core_foundation.sql", import.meta.url), "utf8");
const page = await readFile(new URL("../../app/studio/(protected)/settings/storage/page.tsx", import.meta.url), "utf8");

test("storage RLS fix and rollback are transactional and idempotent", () => {
  for (const sql of [migration, rollback]) {
    assert.match(sql, /^begin;/);
    assert.match(sql, /commit;\s*$/);
    assert.match(sql, /drop policy if exists studio_storage_connection_read/);
    assert.match(sql, /drop policy if exists studio_storage_connection_owner_write/);
    assert.match(sql, /drop policy if exists studio_storage_connection_owner_update/);
  }
});

test("active membership maps auth uid directly to the real user id and owner role", () => {
  assert.match(foundation, /user_id uuid not null references public\.profiles\(id\)/);
  assert.match(foundation, /id uuid primary key references auth\.users\(id\)/);
  assert.match(foundation, /role text not null check\(role in\('owner','admin','team_member','client'\)\)/);
  assert.match(foundation, /m\.user_id=auth\.uid\(\) and m\.status='active' and m\.role=any\(allowed_roles\)/);
});

test("organization owner can insert and reconnect through update or upsert", () => {
  assert.match(migration, /for insert to authenticated[\s\S]*studio_has_organization_role\(organization_id,array\['owner'\]\)/);
  assert.match(migration, /for update to authenticated[\s\S]*using\(public\.studio_has_organization_role\(organization_id,array\['owner'\]\)\)[\s\S]*with check/);
  assert.match(migration, /grant select,insert,update on public\.studio_storage_connections to authenticated/);
});

test("members, other organizations and unauthenticated callers cannot mutate", () => {
  assert.doesNotMatch(migration, /array\['(?:admin|team_member|client)'\]/);
  assert.match(migration, /studio_has_organization_role\(organization_id,array\['owner'\]\)/);
  assert.ok((migration.match(/to authenticated/g) ?? []).length >= 3);
  assert.doesNotMatch(migration, /to anon|to public/);
  assert.doesNotMatch(migration, /for delete|create policy[^;]+delete/is);
});

test("member reads remain organization scoped and safe UI projection excludes tokens", () => {
  assert.match(migration, /for select to authenticated[\s\S]*studio_is_organization_member\(organization_id\)/);
  assert.match(page, /select\("account_email,root_folder_name,projects_folder_id,status,last_verified_at,last_error_code"\)/);
  const uiProjection = page.match(/\.select\("([^"]+)"\)/)?.[1] ?? "";
  assert.doesNotMatch(uiProjection, /encrypted_access_token|encrypted_refresh_token/);
});

test("audit ids are bound to the authenticated owner", () => {
  assert.match(migration, /created_by=auth\.uid\(\)/);
  assert.match(migration, /updated_by=auth\.uid\(\)/);
});
