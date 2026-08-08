import {NextResponse} from "next/server";
import {z} from "zod";
import {sendClientInvitationEmail} from "@/lib/studio/client-access/client-invitation-email";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import {createClientInvitationUrl} from "@/lib/routing/app-domains";

const privateHeaders={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
export async function POST(request:Request,{params}:{params:Promise<{projectId:string;invitationId:string}>}){
  const values=await params;
  if(!z.string().uuid().safeParse(values.projectId).success||!z.string().uuid().safeParse(values.invitationId).success)return NextResponse.json({error:"Davet bulunamadı."},{status:404,headers:privateHeaders});
  const expiresAt=new Date(Date.now()+7*86400000).toISOString();
  const supabase=await createStudioServerClient();
  const{data,error}=await supabase.rpc("studio_renew_client_invitation",{p_project_id:values.projectId,p_invitation_id:values.invitationId,p_expires_at:expiresAt});
  if(error||!data?.[0]?.invitation_token)return NextResponse.json({error:"Davet bulunamadı."},{status:404,headers:privateHeaders});
  const invitationUrl=createClientInvitationUrl(request.url,data[0].invitation_token);
  const[{data:invitations},{data:project}]=await Promise.all([
    supabase.rpc("studio_list_client_invitations",{p_project_id:values.projectId}),
    supabase.from("studio_projects").select("name").eq("id",values.projectId).maybeSingle(),
  ]);
  const invitation=(invitations as Array<{id:string;invited_email:string}>|null)?.find((item)=>item.id===data[0].invitation_id);
  const emailDelivery=invitation?.invited_email?await sendClientInvitationEmail({email:invitation.invited_email,projectName:project?.name||"ARZ Studio projesi",invitationUrl,expiresAt:data[0].expires_at}):"failed";
  return NextResponse.json({invitationUrl,expiresAt:data[0].expires_at,emailDelivery},{headers:privateHeaders});
}
