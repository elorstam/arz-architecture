import "server-only";
import {getStudioContext} from "@/lib/studio/auth/get-studio-context";
import {createStudioServerClient} from "@/lib/studio/supabase/server";

export type ClientPortalProject={id:string;code:string;name:string;category:string;location:string;stage:string;status:string;progress:number;current_phase:string;target_date:string|null;next_milestone:string;next_milestone_date:string|null;updated_at:string};

export async function getClientPortalContext(selectedProjectId?:string){
 const context=await getStudioContext();
 if(!context?.user)return null;
 if(!context.membership||context.membership.role!=="client")return{user:context.user,membership:null,projects:[],project:null};
 const db=await createStudioServerClient();
 const{data,error}=await db.rpc("client_portal_list_projects");
 if(error)throw new Error("client_portal_context_unavailable");
 const projects=(data??[]) as ClientPortalProject[];
 const project=selectedProjectId?projects.find(item=>item.id===selectedProjectId)??null:projects[0]??null;
 const profile=Array.isArray(context.membership.profiles)?context.membership.profiles[0]:context.membership.profiles;
 return{user:context.user,membership:context.membership,projects,project,profile:{id:profile?.id??context.user.id,fullName:profile?.full_name||"Müşteri",email:profile?.email||context.user.email||""}};
}
