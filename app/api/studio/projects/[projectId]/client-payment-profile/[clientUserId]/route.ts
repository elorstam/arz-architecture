import {NextResponse} from "next/server";
import {ZodError} from "zod";
import {saveStudioClientPaymentProfile} from "@/lib/studio/client-access/client-payment-profile";

const response=(body:unknown,status:number)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
export async function PATCH(request:Request,{params}:{params:Promise<{projectId:string;clientUserId:string}>}){const{projectId,clientUserId}=await params;const body=await request.json().catch(()=>null);if(!body)return response({error:"Geçersiz istek."},400);try{await saveStudioClientPaymentProfile(projectId,clientUserId,body);return response({ok:true},200);}catch(error){if(error instanceof ZodError)return response({error:"Ödeme ve fatura alanlarını geçerli ve eksiksiz girin."},400);const code=error instanceof Error?error.message:"payment_profile_save_failed";return response({error:code==="forbidden"?"Yetkisiz işlem.":code==="client_access_not_found"?"Aktif müşteri erişimi bulunamadı.":"Ödeme bilgileri kaydedilemedi."},code==="forbidden"?403:code==="client_access_not_found"?404:400);}}
