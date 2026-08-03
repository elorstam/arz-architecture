import "server-only";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import type {ClientStage} from "@/lib/client-portal/get-client-dashboard";
export async function getClientStages(projectId:string){const db=await createStudioServerClient();const{data,error}=await db.rpc("client_portal_list_stages",{p_project_id:projectId});if(error)throw new Error("client_stages_unavailable");return(data??[]) as ClientStage[]}
