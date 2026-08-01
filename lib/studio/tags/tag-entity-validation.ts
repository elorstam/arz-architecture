/* eslint-disable @typescript-eslint/no-explicit-any -- Supabase schema is untyped; this server-only adapter exposes only from(). */
import type{StudioTagEntityType}from"./tag-types";
import{StudioTagError}from"./tag-errors";
const tables:Record<StudioTagEntityType,string>={project:"studio_projects",crm_lead:"studio_leads",quote:"studio_quotes",file:"studio_project_files",file_version:"studio_project_file_versions",folder:"studio_project_folders"};
export async function validateTagEntityAccess(supabase:{from:(table:string)=>any},organizationId:string,type:StudioTagEntityType,id:string){const{data,error}=await supabase.from(tables[type]).select("id").eq("id",id).eq("organization_id",organizationId).maybeSingle();if(error||!data)throw new StudioTagError("invalid_entity","Geçersiz kayıt türü veya kayıt bulunamadı.");}
