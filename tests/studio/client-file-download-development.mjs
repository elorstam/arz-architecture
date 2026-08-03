import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {randomUUID} from "node:crypto";
import {mkdtempSync,rmSync,writeFileSync} from "node:fs";
import {readFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";

const config=Object.fromEntries((await readFile(".env.local","utf8")).split(/\r?\n/).filter(line=>line&&!line.startsWith("#")&&line.includes("=")).map(line=>{const i=line.indexOf("=");return[line.slice(0,i).trim(),line.slice(i+1).trim().replace(/^['"]|['"]$/g,"")]}));
const supabaseUrl=config.NEXT_PUBLIC_SUPABASE_URL,anon=config.NEXT_PUBLIC_SUPABASE_ANON_KEY,service=config.SUPABASE_SERVICE_ROLE_KEY;
const appUrl=process.env.CLIENT_DOWNLOAD_BASE_URL??"http://127.0.0.1:3219";
assert.equal(new URL(supabaseUrl).hostname,"yegtxoipfpleacgjfndb.supabase.co","development ref mismatch");
const marker=`codex-client-download-${Date.now()}`,password=`Arz-${randomUUID()}-Aa1!`;
const id={orgA:randomUUID(),orgB:randomUUID(),a1:randomUUID(),a2:randomUUID(),b1:randomUUID(),stageA1:randomUUID(),stageA2:randomUUID(),stageB1:randomUUID(),visible:randomUUID(),hidden:randomUUID(),pending:randomUUID(),archived:randomUUID(),other:randomUUID(),cross:randomUUID(),version:randomUUID(),versionHidden:randomUUID(),versionArchived:randomUUID(),versionOther:randomUUID(),versionCross:randomUUID()};
const users={},content=Buffer.from("ARZ secure client download integration\n","utf8");
const storagePath=`organizations/${id.orgA}/projects/${id.a1}/files/${id.visible}/visible.pdf`;

async function api(path,{key=service,token=key,method="GET",body,headers={}}={}){const response=await fetch(`${supabaseUrl}${path}`,{method,headers:{apikey:key,Authorization:`Bearer ${token}`,...(body?{"content-type":"application/json"}:{}),...headers},body:body?JSON.stringify(body):undefined});const text=await response.text();let data=text;try{data=text?JSON.parse(text):null}catch{}if(!response.ok)throw new Error(`${method} ${path}: ${response.status} ${text}`);return{response,data};}
function sql(statement){const dir=mkdtempSync(join(tmpdir(),"arz-client-download-")),file=join(dir,"query.sql");try{writeFileSync(file,statement,"utf8");return execFileSync(process.env.ComSpec??"cmd.exe",["/d","/s","/c",`npx.cmd supabase db query --linked --file ${file}`],{encoding:"utf8"})}finally{rmSync(dir,{recursive:true,force:true})}}
async function createUser(name,role){const email=`${marker}-${name}@example.invalid`;const{data}=await api("/auth/v1/admin/users",{method:"POST",body:{email,password,email_confirm:true,user_metadata:{full_name:`Download ${name}`}}});users[name]={id:data.id,email,role};}
async function login(name){const response=await fetch(`${appUrl}/api/studio/auth/login`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:users[name].email,password}),redirect:"manual"});assert.equal(response.status,200,`${name} login`);const cookies=response.headers.getSetCookie().map(value=>value.split(";",1)[0]).join("; ");assert.ok(cookies.includes("sb-"),`${name} session cookie missing`);return cookies;}
async function download(fileId,cookie){return fetch(`${appUrl}/client/files/${fileId}/download`,{headers:cookie?{cookie}:{},redirect:"manual"});}
async function rpc(name,user,body){return api(`/rest/v1/rpc/${name}`,{key:anon,token:users[user].token,method:"POST",body});}
async function signIn(name){const{data}=await api("/auth/v1/token?grant_type=password",{key:anon,token:anon,method:"POST",body:{email:users[name].email,password}});users[name].token=data.access_token;}

try{
 for(const [name,role] of [["ownerA","owner"],["memberA","team_member"],["clientA","client"],["clientB","client"],["ownerB","owner"]])await createUser(name,role);
 for(const name of Object.keys(users))await signIn(name);
 sql(`begin;
insert into public.profiles(id,email,full_name) values ${Object.entries(users).map(([name,u])=>`('${u.id}','${u.email}','Download ${name}')`).join(",")};
insert into public.organizations(id,name,slug,created_by) values('${id.orgA}','${marker} A','${marker}-a','${users.ownerA.id}'),('${id.orgB}','${marker} B','${marker}-b','${users.ownerB.id}');
insert into public.organization_members(organization_id,user_id,role,created_by) values('${id.orgA}','${users.ownerA.id}','owner','${users.ownerA.id}'),('${id.orgA}','${users.memberA.id}','team_member','${users.ownerA.id}'),('${id.orgA}','${users.clientA.id}','client','${users.ownerA.id}'),('${id.orgA}','${users.clientB.id}','client','${users.ownerA.id}'),('${id.orgB}','${users.ownerB.id}','owner','${users.ownerB.id}');
select set_config('request.jwt.claim.sub','${users.ownerA.id}',true);
insert into public.studio_projects(id,organization_id,code,name,stage,status,created_by,updated_by) values('${id.a1}','${id.orgA}','DLA1','Download A1','Tasarım','Aktif','${users.ownerA.id}','${users.ownerA.id}'),('${id.a2}','${id.orgA}','DLA2','Download A2','Tasarım','Aktif','${users.ownerA.id}','${users.ownerA.id}');
select set_config('request.jwt.claim.sub','${users.ownerB.id}',true);insert into public.studio_projects(id,organization_id,code,name,stage,status,created_by,updated_by) values('${id.b1}','${id.orgB}','DLB1','Download B1','Tasarım','Aktif','${users.ownerB.id}','${users.ownerB.id}');
insert into public.studio_project_stages(id,organization_id,project_id,title,sort_order,is_client_visible,created_by,updated_by) values('${id.stageA1}','${id.orgA}','${id.a1}','A1',9101,true,'${users.ownerA.id}','${users.ownerA.id}'),('${id.stageA2}','${id.orgA}','${id.a2}','A2',9101,true,'${users.ownerA.id}','${users.ownerA.id}'),('${id.stageB1}','${id.orgB}','${id.b1}','B1',9101,true,'${users.ownerB.id}','${users.ownerB.id}');
insert into public.studio_project_files(id,organization_id,project_id,display_name,original_file_name,normalized_file_name,extension,mime_type,file_size,storage_path,category,status,is_archived,uploaded_by,updated_by) values
('${id.visible}','${id.orgA}','${id.a1}','visible.pdf','visible.pdf','visible.pdf','pdf','application/pdf',${content.length},'${storagePath}','document','uploading',false,'${users.ownerA.id}','${users.ownerA.id}'),
('${id.hidden}','${id.orgA}','${id.a1}','hidden.pdf','hidden.pdf','hidden.pdf','pdf','application/pdf',1,'organizations/${id.orgA}/projects/${id.a1}/files/${id.hidden}/hidden.pdf','document','uploading',false,'${users.ownerA.id}','${users.ownerA.id}'),
('${id.pending}','${id.orgA}','${id.a1}','pending.pdf','pending.pdf','pending.pdf','pdf','application/pdf',1,'organizations/${id.orgA}/projects/${id.a1}/files/${id.pending}/pending.pdf','document','uploading',false,'${users.ownerA.id}','${users.ownerA.id}'),
('${id.archived}','${id.orgA}','${id.a1}','archived.pdf','archived.pdf','archived.pdf','pdf','application/pdf',1,'organizations/${id.orgA}/projects/${id.a1}/files/${id.archived}/archived.pdf','document','uploading',true,'${users.ownerA.id}','${users.ownerA.id}'),
('${id.other}','${id.orgA}','${id.a2}','other.pdf','other.pdf','other.pdf','pdf','application/pdf',1,'organizations/${id.orgA}/projects/${id.a2}/files/${id.other}/other.pdf','document','uploading',false,'${users.ownerA.id}','${users.ownerA.id}'),
('${id.cross}','${id.orgB}','${id.b1}','cross.pdf','cross.pdf','cross.pdf','pdf','application/pdf',1,'organizations/${id.orgB}/projects/${id.b1}/files/${id.cross}/cross.pdf','document','uploading',false,'${users.ownerB.id}','${users.ownerB.id}');
insert into public.studio_project_file_versions(id,organization_id,project_id,file_id,version_number,is_current,status,storage_provider,storage_bucket,storage_path,original_file_name,normalized_file_name,extension,mime_type,file_size,uploaded_by) values
('${id.version}','${id.orgA}','${id.a1}','${id.visible}',1,true,'ready','supabase','studio-files','${storagePath}','visible.pdf','visible.pdf','pdf','application/pdf',${content.length},'${users.ownerA.id}'),
('${id.versionHidden}','${id.orgA}','${id.a1}','${id.hidden}',1,true,'ready','supabase','studio-files','organizations/${id.orgA}/projects/${id.a1}/files/${id.hidden}/hidden.pdf','hidden.pdf','hidden.pdf','pdf','application/pdf',1,'${users.ownerA.id}'),
('${id.versionArchived}','${id.orgA}','${id.a1}','${id.archived}',1,true,'ready','supabase','studio-files','organizations/${id.orgA}/projects/${id.a1}/files/${id.archived}/archived.pdf','archived.pdf','archived.pdf','pdf','application/pdf',1,'${users.ownerA.id}'),
('${id.versionOther}','${id.orgA}','${id.a2}','${id.other}',1,true,'ready','supabase','studio-files','organizations/${id.orgA}/projects/${id.a2}/files/${id.other}/other.pdf','other.pdf','other.pdf','pdf','application/pdf',1,'${users.ownerA.id}'),
('${id.versionCross}','${id.orgB}','${id.b1}','${id.cross}',1,true,'ready','supabase','studio-files','organizations/${id.orgB}/projects/${id.b1}/files/${id.cross}/cross.pdf','cross.pdf','cross.pdf','pdf','application/pdf',1,'${users.ownerB.id}');
select set_config('app.studio_version_finalize','1',true);
update public.studio_project_files set current_version_id='${id.version}',version_count=1,latest_version_number=1,status='ready' where id='${id.visible}';
update public.studio_project_files set current_version_id=case id when '${id.hidden}' then '${id.versionHidden}'::uuid when '${id.archived}' then '${id.versionArchived}'::uuid when '${id.other}' then '${id.versionOther}'::uuid when '${id.cross}' then '${id.versionCross}'::uuid end,version_count=1,latest_version_number=1,status='ready' where id in('${id.hidden}','${id.archived}','${id.other}','${id.cross}');
insert into public.studio_project_stage_files(organization_id,project_id,stage_id,file_id,is_customer_visible,created_by) values('${id.orgA}','${id.a1}','${id.stageA1}','${id.visible}',true,'${users.ownerA.id}'),('${id.orgA}','${id.a1}','${id.stageA1}','${id.hidden}',false,'${users.ownerA.id}'),('${id.orgA}','${id.a1}','${id.stageA1}','${id.pending}',true,'${users.ownerA.id}'),('${id.orgA}','${id.a1}','${id.stageA1}','${id.archived}',true,'${users.ownerA.id}'),('${id.orgA}','${id.a2}','${id.stageA2}','${id.other}',true,'${users.ownerA.id}'),('${id.orgB}','${id.b1}','${id.stageB1}','${id.cross}',true,'${users.ownerB.id}');commit;`);
 await rpc("studio_grant_client_project_access","ownerA",{p_project_id:id.a1,p_user_id:users.clientA.id});
 await rpc("studio_grant_client_project_access","ownerA",{p_project_id:id.a2,p_user_id:users.clientB.id});
 const upload=await fetch(`${supabaseUrl}/storage/v1/object/studio-files/${storagePath}`,{method:"POST",headers:{apikey:service,Authorization:`Bearer ${service}`,"content-type":"text/plain","x-upsert":"true"},body:content});assert.ok(upload.ok,await upload.text());
 const bucket=(await api("/storage/v1/bucket/studio-files")).data;assert.equal(bucket.public,false,"bucket must remain private");
 const cookies={};for(const name of Object.keys(users))cookies[name]=await login(name);
 let response=await download(id.visible,cookies.clientA);assert.equal(response.status,200);assert.equal(await response.text(),content.toString());assert.equal(response.headers.get("cache-control"),"private, no-store");assert.equal(response.headers.has("location"),false);assert.equal((await download(id.hidden,cookies.clientA)).status,404);assert.equal((await download(id.pending,cookies.clientA)).status,404);assert.equal((await download(id.archived,cookies.clientA)).status,404);assert.equal((await download(id.other,cookies.clientA)).status,404);assert.equal((await download(id.cross,cookies.clientA)).status,404);assert.equal((await download(id.visible,cookies.clientB)).status,404);assert.equal((await download(id.visible,null)).status,401);assert.equal((await download(randomUUID(),cookies.clientA)).status,404);
 response=await download(id.visible,cookies.ownerA);assert.equal(response.status,404,"client endpoint must not broaden staff authority");
 const studio=await fetch(`${appUrl}/studio/projects/${id.a1}/files/${id.visible}/download`,{headers:{cookie:cookies.ownerA},redirect:"manual"});assert.ok([200,303].includes(studio.status),`owner canonical download ${studio.status}`);
 await rpc("studio_revoke_client_project_access","ownerA",{p_project_id:id.a1,p_user_id:users.clientA.id});assert.equal((await download(id.visible,cookies.clientA)).status,404);
 const signed=(await api(`/storage/v1/object/sign/studio-files/${storagePath}`,{method:"POST",body:{expiresIn:1}})).data.signedURL;await new Promise(resolve=>setTimeout(resolve,2100));assert.equal((await fetch(`${supabaseUrl}/storage/v1${signed}`)).ok,false,"expired URL must fail");
 console.log("client file download authenticated matrix: PASS");
}finally{
 await fetch(`${supabaseUrl}/storage/v1/object/studio-files/${storagePath}`,{method:"DELETE",headers:{apikey:service,Authorization:`Bearer ${service}`}}).catch(()=>{});
 try{sql(`begin;set local session_replication_role=replica;do $x$ declare r record;begin for r in select table_name from information_schema.columns where table_schema='public' and column_name='organization_id' loop execute format('delete from public.%I where organization_id=any($1)',r.table_name) using array['${id.orgA}'::uuid,'${id.orgB}'::uuid];end loop;end $x$;delete from public.organizations where id in('${id.orgA}','${id.orgB}');commit;`)}catch{}
 for(const user of Object.values(users))await api(`/auth/v1/admin/users/${user.id}`,{method:"DELETE"}).catch(()=>{});
}
