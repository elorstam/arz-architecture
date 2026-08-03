import "server-only";
import {createHash} from "node:crypto";
import {createClient} from "@supabase/supabase-js";
import {createStudioServerClient} from "@/lib/studio/supabase/server";

export type ClientInvitationState="valid"|"expired"|"accepted"|"revoked"|"invalid";
export type ClientInvitationPreview={state:ClientInvitationState;projectName?:string;email?:string;expiresAt?:string};

function adminClient(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new Error("client_invitation_service_unavailable");
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
}

export function safeClientNext(value:string|undefined){
 if(!value||!value.startsWith("/")||value.startsWith("//")||value.includes("\\")||/[\u0000-\u001f]/.test(value))return "/client";
 try{const parsed=new URL(value,"http://client.local");return parsed.origin==="http://client.local"&&parsed.pathname.startsWith("/client")&&!parsed.pathname.startsWith("/client/login")&&!parsed.pathname.startsWith("/client/invite/")?`${parsed.pathname}${parsed.search}${parsed.hash}`:"/client";}catch{return "/client";}
}

export async function getInvitationPreview(token:string):Promise<ClientInvitationPreview>{
 if(!token||token.length>512)return{state:"invalid"};
 const hash=createHash("sha256").update(token).digest("hex");
 const{data,error}=await adminClient().from("studio_client_invitations").select("invited_email,status,expires_at,studio_projects(name)").eq("token_hash",hash).maybeSingle();
 if(error||!data)return{state:"invalid"};
 const status=data.status as string;
 const state:ClientInvitationState=status==="accepted"?"accepted":status==="revoked"?"revoked":status==="expired"||new Date(data.expires_at).getTime()<=Date.now()?"expired":status==="pending"?"valid":"invalid";
 const project=Array.isArray(data.studio_projects)?data.studio_projects[0]:data.studio_projects;
 return{state,projectName:project?.name,email:data.invited_email,expiresAt:data.expires_at};
}

export async function resolveAuthenticatedDestination(){
 const supabase=await createStudioServerClient();
 const{data:{user}}=await supabase.auth.getUser();
 if(!user)return{kind:"unauthenticated" as const};
 const{data:memberships}=await supabase.from("organization_members").select("role").eq("user_id",user.id).eq("status","active");
 if(!memberships?.length)return{kind:"no-access" as const};
 if(memberships.some(item=>item.role!=="client"))return{kind:"staff" as const,destination:"/studio" as const};
 const{data:projects,error}=await supabase.rpc("client_portal_list_projects");
 return !error&&projects?.length?{kind:"client" as const,destination:"/client" as const}:{kind:"no-access" as const};
}
