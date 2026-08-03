import "server-only";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import type {ClientFinance} from "./get-client-dashboard";
export async function getClientFinance(projectId:string):Promise<ClientFinance[]>{const db=await createStudioServerClient();const{data,error}=await db.rpc("client_portal_list_finance",{p_project_id:projectId});if(error){console.error("CLIENT_FINANCE_PROJECTION_FAILED",{code:error.code});throw new Error("client_finance_unavailable");}return(data??[]) as ClientFinance[];}
