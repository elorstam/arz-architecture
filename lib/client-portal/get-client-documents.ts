import "server-only";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import type {ClientProcess} from "./get-client-dashboard";
export async function getClientDocuments(projectId:string):Promise<ClientProcess[]>{const db=await createStudioServerClient();const{data,error}=await db.rpc("client_portal_list_official_processes",{p_project_id:projectId});if(error){console.error("CLIENT_DOCUMENTS_PROJECTION_FAILED",{code:error.code});throw new Error("client_documents_unavailable");}return(data??[]) as ClientProcess[];}
