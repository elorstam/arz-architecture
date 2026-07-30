import {NextResponse} from "next/server";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
export async function POST(){
 try{
  const supabase=await createStudioServerClient();const{data:{user}}=await supabase.auth.getUser();
  if(user){const{data:membership}=await supabase.from("organization_members").select("organization_id").eq("user_id",user.id).eq("status","active").limit(1).maybeSingle();if(membership)await supabase.rpc("studio_record_activity",{target_organization_id:membership.organization_id,event_entity_type:"auth",event_entity_id:null,event_action:"auth.logout",event_summary:"Studio logout completed.",event_metadata:{}});}
  await supabase.auth.signOut();return NextResponse.json({success:true});
 }catch(error){console.error("Studio logout failed",error);return NextResponse.json({error:"Oturum güvenli biçimde kapatılamadı."},{status:500});}
}
