import "server-only";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import type {ClientRender} from "./get-client-dashboard";
export async function getClientRenders(projectId:string):Promise<ClientRender[]>{const db=await createStudioServerClient();const{data,error}=await db.rpc("client_portal_list_renders",{p_project_id:projectId});if(error){console.error("CLIENT_RENDERS_PROJECTION_FAILED",{code:error.code});throw new Error("client_renders_unavailable");}return(data??[]) as ClientRender[];}
