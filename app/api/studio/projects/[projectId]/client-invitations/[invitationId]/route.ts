import {NextResponse} from "next/server";
import {z} from "zod";
import {createStudioServerClient} from "@/lib/studio/supabase/server";

const privateHeaders={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
export async function DELETE(_:Request,{params}:{params:Promise<{projectId:string;invitationId:string}>}){
  const values=await params;
  if(!z.string().uuid().safeParse(values.projectId).success||!z.string().uuid().safeParse(values.invitationId).success)return NextResponse.json({error:"Davet bulunamadı."},{status:404,headers:privateHeaders});
  const supabase=await createStudioServerClient();
  const{data,error}=await supabase.rpc("studio_revoke_client_invitation",{p_project_id:values.projectId,p_invitation_id:values.invitationId});
  if(error||data!==true)return NextResponse.json({error:"Davet bulunamadı."},{status:404,headers:privateHeaders});
  return NextResponse.json({ok:true},{headers:privateHeaders});
}
