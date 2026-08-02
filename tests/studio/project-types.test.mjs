import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const migration=fs.readFileSync("supabase/migrations/029_project_type_management.sql","utf8");
const constants=fs.readFileSync("lib/studio/projects/project-constants.ts","utf8");
test("active project type list is limited to permit and visualization",()=>{assert.match(constants,/Ruhsat/);assert.match(constants,/Görselleştirme/);assert.match(constants,/PROJECT_STAGES/);});
test("project type migration is soft-disable and owner scoped",()=>{assert.match(migration,/studio_project_types/);assert.match(migration,/is_active/);assert.match(migration,/is_system/);assert.match(migration,/studio_project_types_owner_update/);assert.match(migration,/revoke delete/);assert.match(migration,/proposal.*false/);});
