import "server-only";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import type {ClientFile} from "./get-client-dashboard";
export async function getClientFiles(projectId:string):Promise<ClientFile[]>{const db=await createStudioServerClient();const{data,error}=await db.rpc("client_portal_list_files",{p_project_id:projectId});if(error){console.error("CLIENT_FILES_PROJECTION_FAILED",{code:error.code});throw new Error("client_files_unavailable");}return(data??[]) as ClientFile[];}
