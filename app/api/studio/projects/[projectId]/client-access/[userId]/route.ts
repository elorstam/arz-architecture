import {NextResponse} from "next/server";
import {z} from "zod";
import {createStudioServerClient} from "@/lib/studio/supabase/server";

const privateHeaders={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
export async function DELETE(_:Request,{params}:{params:Promise<{projectId:string;userId:string}>}){
  const values=await params;
  if(!z.string().uuid().safeParse(values.projectId).success||!z.string().uuid().safeParse(values.userId).success)return NextResponse.json({error:"Erişim bulunamadı."},{status:404,headers:privateHeaders});
  const supabase=await createStudioServerClient();
  const{data,error}=await supabase.rpc("studio_revoke_client_project_access",{p_project_id:values.projectId,p_user_id:values.userId});
  if(error||data!==true)return NextResponse.json({error:"Erişim bulunamadı."},{status:404,headers:privateHeaders});
  return NextResponse.json({ok:true},{headers:privateHeaders});
}
