import {NextResponse} from "next/server";
import {z} from "zod";
import {createStudioServerClient} from "@/lib/studio/supabase/server";

const schema=z.union([z.object({notificationId:z.string().uuid()}),z.object({projectId:z.string().uuid(),all:z.literal(true)})]);

export async function POST(request:Request){
 const input=schema.safeParse(await request.json().catch(()=>null));
 if(!input.success)return NextResponse.json({error:"Bildirim bulunamadı veya erişim reddedildi."},{status:404,headers:{"Cache-Control":"private, no-store"}});
 const db=await createStudioServerClient();
 if("notificationId" in input.data){const{data,error}=await db.rpc("client_portal_mark_notification_read",{p_notification_id:input.data.notificationId});if(error){console.error("CLIENT_NOTIFICATION_READ_FAILED",{code:error.code});return NextResponse.json({error:"Bildirim durumu güncellenemedi."},{status:503,headers:{"Cache-Control":"private, no-store"}});}if(!data)return NextResponse.json({error:"Bildirim bulunamadı veya erişim reddedildi."},{status:404,headers:{"Cache-Control":"private, no-store"}});return NextResponse.json({success:true},{headers:{"Cache-Control":"private, no-store"}});}
 const{data,error}=await db.rpc("client_portal_mark_project_notifications_read",{p_project_id:input.data.projectId});
 if(error){console.error("CLIENT_NOTIFICATIONS_READ_ALL_FAILED",{code:error.code});return NextResponse.json({error:"Bildirim durumları güncellenemedi."},{status:503,headers:{"Cache-Control":"private, no-store"}});}
 if(Number(data)<0)return NextResponse.json({error:"Bildirimler bulunamadı veya erişim reddedildi."},{status:404,headers:{"Cache-Control":"private, no-store"}});
 return NextResponse.json({success:true,count:Number(data)||0},{headers:{"Cache-Control":"private, no-store"}});
}
