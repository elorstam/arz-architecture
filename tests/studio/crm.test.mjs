import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const migration=await readFile(new URL("../../supabase/migrations/003_studio_leads.sql",import.meta.url),"utf8");
const rollback=await readFile(new URL("../../supabase/migrations/003_studio_leads.rollback.sql",import.meta.url),"utf8");
const repository=await readFile(new URL("../../lib/studio/crm/lead-repository.ts",import.meta.url),"utf8");
const actions=await readFile(new URL("../../app/studio/(protected)/crm/actions.ts",import.meta.url),"utf8");
const mapper=await readFile(new URL("../../lib/studio/crm/lead-mappers.ts",import.meta.url),"utf8");
const detail=await readFile(new URL("../../components/studio/crm/StudioLeadDetail.tsx",import.meta.url),"utf8");
const{isStudioLeadId,studioLeadSchema}=await import("../../lib/studio/crm/lead-validation.ts");
const{leadInputToRow,summarizeLeadStages}=await import("../../lib/studio/crm/lead-mappers.ts");

const validLead={firstName:"Ayşe",lastName:"Yılmaz",companyName:"",phone:"+90 555 000 00 00",email:"",city:"Mersin",district:"Yenişehir",
 serviceType:"Villa",budgetAmount:"1250000.50",budgetCurrency:"TRY",source:"Referans",stage:"Yeni Lead",status:"Aktif",notes:"",
 assignedUserId:"",lastContactAt:"",nextFollowUpAt:""};

test("lead migration and rollback are transaction-balanced and seed-free",()=>{
 for(const sql of[migration,rollback]){assert.match(sql,/^begin;/);assert.match(sql,/commit;\s*$/);assert.equal((sql.match(/\$\$/g)??[]).length%2,0);}
 assert.match(migration,/create table if not exists public\.studio_leads/);assert.doesNotMatch(migration,/insert into public\.studio_leads/i);
 assert.match(rollback,/drop table if exists public\.studio_leads/);
});
test("database constraints bound CRM values, money and terminal status",()=>{
 assert.match(migration,/first_name text not null/);assert.match(migration,/phone text not null/);
 assert.match(migration,/budget_amount numeric\(14,2\) null check\(budget_amount is null or budget_amount>=0\)/);
 assert.match(migration,/budget_currency in\('TRY','USD','EUR'\)/);
 assert.match(migration,/stage in\('Yeni Lead','İlk Görüşme','İhtiyaç Analizi','Teklif Hazırlanıyor','Teklif Gönderildi','Kazanıldı','Kaybedildi'\)/);
 assert.match(migration,/stage in\('Kazanıldı','Kaybedildi'\) and status='Kapandı'/);
});
test("RLS allows member reads, owner writes and no hard delete",()=>{
 assert.match(migration,/enable row level security/);assert.match(migration,/for select to authenticated[\s\S]*studio_is_organization_member\(organization_id\)/);
 assert.match(migration,/for insert to authenticated[\s\S]*array\['owner'\]/);assert.match(migration,/for update to authenticated[\s\S]*array\['owner'\]/);
 assert.doesNotMatch(migration,/create policy[\s\S]{0,100}for delete/);assert.match(migration,/revoke delete on public\.studio_leads from anon,authenticated/);
});
test("audit, organization and assigned-user isolation are protected in SQL",()=>{
 assert.match(migration,/new\.organization_id is distinct from old\.organization_id/);assert.match(migration,/new\.created_by is distinct from old\.created_by/);
 assert.match(migration,/new\.updated_by=auth\.uid\(\)/);assert.match(migration,/assigned_user_id[\s\S]*organization_members[\s\S]*status='active'/);
});
test("repository scopes operations and performs owner authorization",()=>{
 assert.ok((repository.match(/\.eq\("organization_id",context\.organizationId\)/g)??[]).length>=6);
 assert.match(repository,/requireLeadContext\(true\)/);assert.match(repository,/assertAssignedMember/);
 assert.doesNotMatch(repository,/organizationId\s*:\s*input\./);assert.doesNotMatch(repository,/\.delete\(/);
});
test("actions accept allowlisted validated fields only",()=>{
 assert.match(actions,/parseStudioLeadForm\(formData\)/);assert.doesNotMatch(actions,/formData\.get\(["']organization_id/);
 assert.doesNotMatch(actions,/created_by|updated_by|is_archived/);
 const mutationMapper=mapper.match(/export function leadInputToRow[\s\S]*?\n}\n/)?.[0]??"";
 assert.match(mutationMapper,/first_name:input\.firstName/);assert.doesNotMatch(mutationMapper,/organization_id|created_by|updated_by|is_archived/);
});
test("CRM detail actions use shared readable button variants",()=>{
 assert.match(detail,/studioButtonClass\("outline", "md"\)[\s\S]*Teklif Oluştur/);
 assert.match(detail,/studioButtonClass\("primary", "md"\)[\s\S]*Düzenle/);
 assert.doesNotMatch(detail,/bg-\[#18222d\][^\n]*Düzenle/);
});
test("CRM detail cards use shared premium typography tokens",()=>{
 assert.match(detail,/studio-card__title/);assert.match(detail,/studio-section-title/);
 assert.match(detail,/studio-meta-label/);assert.match(detail,/studio-meta-value/);
 assert.match(detail,/studio-helper-text/);
});
test("valid lead and defaults-compatible input pass",()=>assert.equal(studioLeadSchema.safeParse(validLead).success,true));
test("required name and phone are rejected",()=>{assert.equal(studioLeadSchema.safeParse({...validLead,firstName:" "}).success,false);assert.equal(studioLeadSchema.safeParse({...validLead,phone:" "}).success,false);});
test("email, budget and controlled values are validated",()=>{
 assert.equal(studioLeadSchema.safeParse({...validLead,email:"yanlış"}).success,false);
 assert.equal(studioLeadSchema.safeParse({...validLead,budgetAmount:"-1"}).success,false);
 for(const field of["stage","status","serviceType","source","budgetCurrency"])assert.equal(studioLeadSchema.safeParse({...validLead,[field]:"Geçersiz"}).success,false);
});
test("assigned user must be empty or UUID",()=>assert.equal(studioLeadSchema.safeParse({...validLead,assignedUserId:"owner"}).success,false));
test("terminal stage requires closed status and closed status requires terminal stage",()=>{
 assert.equal(studioLeadSchema.safeParse({...validLead,stage:"Kazanıldı",status:"Aktif"}).success,false);
 assert.equal(studioLeadSchema.safeParse({...validLead,stage:"Yeni Lead",status:"Kapandı"}).success,false);
 assert.equal(studioLeadSchema.safeParse({...validLead,stage:"Kaybedildi",status:"Kapandı"}).success,true);
});
test("input mapper excludes protected and audit fields",()=>{
 const row=leadInputToRow(validLead);assert.equal(row.first_name,"Ayşe");
 for(const key of["organization_id","created_by","updated_by","is_archived","created_at","updated_at"])assert.equal(key in row,false);
});
test("summary counts real stage groups and ignores absent rows",()=>{
 assert.deepEqual(summarizeLeadStages([]),{total:0,newLeads:0,awaitingQuote:0,won:0,lost:0});
 assert.deepEqual(summarizeLeadStages([{stage:"Yeni Lead"},{stage:"Teklif Hazırlanıyor"},{stage:"Teklif Gönderildi"},{stage:"Kazanıldı"},{stage:"Kaybedildi"}]),{total:5,newLeads:1,awaitingQuote:2,won:1,lost:1});
 assert.match(repository,/\.eq\("is_archived",false\)/);
});
test("invalid UUIDs are rejected before lead lookup",()=>{assert.equal(isStudioLeadId("not-a-lead"),false);assert.equal(isStudioLeadId("550e8400-e29b-41d4-a716-446655440000"),true);assert.match(repository,/if\(!isStudioLeadId\(leadId\)\)return null/);});
