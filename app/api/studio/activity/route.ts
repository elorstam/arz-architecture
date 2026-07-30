import {NextResponse} from "next/server";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import {studioActivitySchema} from "@/lib/studio/validation/auth";
export async function POST(request:Request){
 const input=studioActivitySchema.safeParse(await request.json().catch(()=>null));if(!input.success)return NextResponse.json({error:"Geçersiz aktivite verisi."},{status:400});
 try{const supabase=await createStudioServerClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"Yetkisiz."},{status:401});const{error}=await supabase.rpc("studio_record_activity",{target_organization_id:input.data.organizationId,event_entity_type:input.data.entityType,event_entity_id:input.data.entityId,event_action:input.data.action,event_summary:input.data.summary,event_metadata:input.data.metadata});if(error)throw error;return NextResponse.json({success:true});}
 catch(error){console.error("Studio activity could not be recorded",error);return NextResponse.json({error:"Aktivite kaydedilemedi."},{status:500});}
}
