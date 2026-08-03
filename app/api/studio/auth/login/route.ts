import {NextResponse} from "next/server";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import {studioLoginSchema} from "@/lib/studio/validation/auth";
export async function POST(request:Request){
 try{
  const body=studioLoginSchema.safeParse(await request.json().catch(()=>null));
  if(!body.success)return NextResponse.json({error:"Geçerli e-posta ve parola gerekli."},{status:400});
  const supabase=await createStudioServerClient();
  const{data,error}=await supabase.auth.signInWithPassword(body.data);
  if(error||!data.user)return NextResponse.json({error:"E-posta veya parola hatalı."},{status:401});
  const{data:membership}=await supabase.from("organization_members").select("organization_id,status,role").eq("user_id",data.user.id).eq("status","active").limit(1).maybeSingle();
  if(!membership){
   await supabase.rpc("studio_record_activity",{target_organization_id:null,event_entity_type:"auth",event_entity_id:null,event_action:"auth.access_denied",event_summary:"Authenticated user has no active Studio membership.",event_metadata:{}});
   await supabase.auth.signOut();
   return NextResponse.json({error:"Bu kullanıcı için aktif Studio üyeliği bulunmuyor."},{status:403});
  }
  await supabase.rpc("studio_record_activity",{target_organization_id:membership.organization_id,event_entity_type:"auth",event_entity_id:null,event_action:"auth.login",event_summary:"Studio login completed.",event_metadata:{}});
  return NextResponse.json({success:true,destination:membership.role==="client"?"/client":"/studio"});
 }catch(error){console.error("Studio login failed",error);return NextResponse.json({error:"Studio giriş servisi şu anda kullanılamıyor."},{status:503});}
}
