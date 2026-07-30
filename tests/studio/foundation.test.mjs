import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const migrationPath = new URL("../../supabase/migrations/001_studio_core_foundation.sql", import.meta.url);
const proxyPath = new URL("../../proxy.ts", import.meta.url);
const migration = (await readFile(migrationPath, "utf8")).toLowerCase();
const proxy = await readFile(proxyPath, "utf8");

test("mevcut next-intl matcher değeri değişmeden korunur", () => {
  assert.match(
    proxy,
    /matcher:\s*\["\/\(\(\?!api\|admin\|_next\|_vercel\|\.\*\\\\\.\.\*\)\.\*\)"\]/,
  );
  assert.match(proxy, /return intlProxy\(request\)/);
  assert.match(proxy, /refreshStudioSession\(request\)/);
});

test("ilk dilim yalnız onaylanan Studio tablolarını ekler", () => {
  for (const table of ["profiles", "organizations", "organization_members", "activity_events"]) {
    assert.match(migration, new RegExp(`create table if not exists public\\.${table}\\b`));
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
  }

  for (const excluded of [
    "invitations",
    "companies",
    "clients",
    "studio_projects",
    "renders",
    "permits",
    "quotes",
    "payments",
    "invoices",
  ]) {
    assert.doesNotMatch(migration, new RegExp(`create table[^;]*public\\.${excluded}\\b`));
  }

  for (const cmsTable of ["projects", "posts", "media", "site_translations"]) {
    assert.doesNotMatch(
      migration,
      new RegExp(`(?:alter|drop|truncate|delete from)\\s+table?\\s*public\\.${cmsTable}\\b`),
    );
  }
});

test("roller text check constraint kullanır ve enum oluşturulmaz", () => {
  assert.doesNotMatch(migration, /create\s+type\b/);
  assert.match(migration, /role text not null check\(role in\('owner','admin','team_member','client'\)\)/);
  assert.match(migration, /status text not null default 'active' check\(status in\('active','suspended'\)\)/);
});

test("profil email alanı nullable ve kontrollü sunucu alanıdır", () => {
  assert.match(migration, /email text null/);
  assert.match(migration, /auth\.role\(\)<>'service_role'/);
  assert.match(migration, /new\.email is distinct from old\.email/);
});

test("son aktif owner veritabanı triggerı ve transaction kilidiyle korunur", () => {
  assert.match(migration, /create trigger organization_members_protect_last_owner before update or delete/);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /role='owner' and m\.status='active'/);
  assert.match(migration, /an organization must retain at least one active owner/);
});

test("bootstrap yalnız service role içindir ve ikinci owner bootstrap reddedilir", () => {
  assert.match(migration, /if auth\.role\(\)<>'service_role'/);
  assert.match(migration, /studio owner already exists; bootstrap refused/);
  assert.match(
    migration,
    /revoke all on function public\.studio_bootstrap_owner\(uuid,text,text,text,text\) from public,anon,authenticated/,
  );
  assert.match(
    migration,
    /grant execute on function public\.studio_bootstrap_owner\(uuid,text,text,text,text\) to service_role/,
  );
});

test("istemcinin activity yazması RPC ile sınırlandırılmıştır", () => {
  assert.match(migration, /event_action not in\('auth\.login','auth\.logout','auth\.access_denied'\)/);
  assert.match(migration, /revoke insert,update,delete on public\.activity_events from anon,authenticated/);
});
