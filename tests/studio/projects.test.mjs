import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const migration=await readFile(new URL("../../supabase/migrations/002_studio_projects.sql",import.meta.url),"utf8");
const repository=await readFile(new URL("../../lib/studio/projects/project-repository.ts",import.meta.url),"utf8");
const actions=await readFile(new URL("../../app/studio/(protected)/projects/actions.ts",import.meta.url),"utf8");
const{isStudioProjectId,studioProjectSchema}=await import("../../lib/studio/projects/project-validation.ts");
const{normalizeProjectError}=await import("../../lib/studio/projects/project-errors.ts");

const validProject={name:"Test Projesi",code:"TP-01",category:"Konut",location:"Mersin",projectYear:"2026",
 clientName:"Test",clientContactName:"",clientEmail:"",clientPhone:"",stage:"Tasarım",status:"Aktif",
 progress:"50",startDate:"2026-08-01",targetDate:"2026-09-01",summary:"",currentPhase:"",
 nextMilestone:"",nextMilestoneDate:"",responsibleUserId:""};

test("studio_projects migration creates only the project table with bounded values",()=>{
 assert.match(migration,/^begin;/);
 assert.match(migration,/commit;\s*$/);
 assert.equal((migration.match(/\$\$/g)??[]).length%2,0,"SQL dollar quotes must be balanced");
 assert.match(migration,/create table if not exists public\.studio_projects/);
 assert.match(migration,/progress integer not null default 0 check\(progress between 0 and 100\)/);
 assert.match(migration,/stage text not null check\(stage in\('Teklif','Ön Tasarım','Tasarım','Ruhsat','Uygulama','Görselleştirme','Teslim'\)\)/);
 assert.match(migration,/status text not null check\(status in\('Aktif','Beklemede','Revizyon','Gecikmiş','Tamamlandı','Arşivlendi'\)\)/);
 assert.match(migration,/studio_projects_org_code_unique[\s\S]*organization_id,lower\(btrim\(code\)\)/);
});
test("RLS limits reads to members and writes to owners without delete policy",()=>{
 assert.match(migration,/enable row level security/);
 assert.match(migration,/for select to authenticated[\s\S]*studio_is_organization_member\(organization_id\)/);
 assert.match(migration,/for insert to authenticated[\s\S]*studio_has_organization_role\(organization_id,array\['owner'\]\)/);
 assert.match(migration,/for update to authenticated[\s\S]*studio_has_organization_role\(organization_id,array\['owner'\]\)/);
 assert.doesNotMatch(migration,/create policy[\s\S]{0,100}for delete/);
 assert.match(migration,/revoke delete on public\.studio_projects from anon,authenticated/);
});
test("controlled organization and audit fields cannot be reassigned",()=>{
 assert.match(migration,/new\.organization_id is distinct from old\.organization_id/);
 assert.match(migration,/new\.created_by is distinct from old\.created_by/);
 assert.match(migration,/new\.updated_by=auth\.uid\(\)/);
 assert.match(migration,/responsible_user_id[\s\S]*organization_members[\s\S]*status='active'/);
});
test("repository scopes every project operation to server context organization",()=>{
 const scoped=(repository.match(/\.eq\("organization_id",context\.organizationId\)/g)??[]).length;
 assert.ok(scoped>=5,`expected at least five organization-scoped operations, received ${scoped}`);
 assert.doesNotMatch(repository,/organizationId\s*:\s*input\./);
 assert.match(repository,/requireProjectContext\(true\)/);
});
test("repository implements create, update, archive and hides archived rows by default",()=>{
 assert.match(repository,/export async function createStudioProject\(/);
 assert.match(repository,/export async function updateStudioProject\(/);
 assert.match(repository,/export async function archiveStudioProject\(/);
 assert.match(repository,/archive:"active"|archive:ProjectArchiveFilter="active"/);
 assert.match(repository,/is_archived:true,status:"Arşivlendi"/);
});
test("duplicate project code is normalized without leaking database details",()=>{
 const error=normalizeProjectError({code:"23505",message:"internal constraint details"});
 assert.equal(error.code,"duplicate_code");
 assert.equal(error.message,"Bu proje kodu daha önce kullanılmış.");
});
test("actions use allowlisted validated input and do not accept organization or audit fields",()=>{
 assert.match(actions,/parseStudioProjectForm\(formData\)/);
 assert.doesNotMatch(actions,/formData\.get\(["']organization_id/);
 assert.doesNotMatch(actions,/created_by|updated_by/);
});
test("valid project input passes",()=>assert.equal(studioProjectSchema.safeParse(validProject).success,true));
test("missing project name is rejected",()=>{
 const result=studioProjectSchema.safeParse({...validProject,name:""});
 assert.equal(result.success,false);assert.match(result.error.issues[0].message,/Proje adı zorunludur/);
});
test("progress over 100 is rejected",()=>assert.equal(studioProjectSchema.safeParse({...validProject,progress:"101"}).success,false));
test("invalid stage is rejected",()=>assert.equal(studioProjectSchema.safeParse({...validProject,stage:"Yanlış"}).success,false));
test("invalid email is rejected",()=>assert.equal(studioProjectSchema.safeParse({...validProject,clientEmail:"yanlış"}).success,false));
test("target date before start date is rejected",()=>assert.equal(studioProjectSchema.safeParse({...validProject,targetDate:"2026-07-01"}).success,false));
test("archived status cannot be mass-assigned from project form",()=>assert.equal(studioProjectSchema.safeParse({...validProject,status:"Arşivlendi"}).success,false));
test("invalid project IDs are rejected before database access",()=>{
 assert.equal(isStudioProjectId("vespera-port"),false);
 assert.equal(isStudioProjectId("550e8400-e29b-41d4-a716-446655440000"),true);
 assert.match(repository,/if\(!isStudioProjectId\(projectId\)\)return null/);
});
