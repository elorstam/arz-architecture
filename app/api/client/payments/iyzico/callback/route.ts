import {NextResponse} from "next/server";
import {appBaseUrl} from "@/lib/routing/app-domains";
import {getIyzicoConfig} from "@/lib/payments/iyzico/config";
import {retrieveCheckout} from "@/lib/payments/iyzico/client";
import {attemptForToken,finalizeAttempt,markAttemptFailed} from "@/lib/payments/iyzico/repository";
import {canonicalPrice} from "@/lib/payments/iyzico/signatures";

export const runtime="nodejs";
const destination=(state:"success"|"failed",reason?:string)=>`${appBaseUrl("client")}/finance?payment=${state}${reason?`&reason=${encodeURIComponent(reason)}`:""}`;
const sameAmount=(left:unknown,right:unknown)=>canonicalPrice(left)===canonicalPrice(right);

export async function POST(request:Request){
 const type=request.headers.get("content-type")||"";let token="";
 if(type.includes("application/json")){const body=await request.json().catch(()=>null) as {token?:unknown}|null;token=typeof body?.token==="string"?body.token:"";}else{const form=await request.formData().catch(()=>null);token=typeof form?.get("token")==="string"?String(form.get("token")):"";}
 if(!token)return NextResponse.json({error:"Invalid callback."},{status:400,headers:{"Cache-Control":"no-store"}});
 const config=getIyzicoConfig();if(!config)return NextResponse.redirect(destination("failed","configuration"),303);
 const attempt=await attemptForToken(token).catch(()=>null);if(!attempt)return NextResponse.redirect(destination("failed","verification"),303);
 if(attempt.status==="succeeded")return NextResponse.redirect(destination("success"),303);
 try{
  const result=await retrieveCheckout(config,attempt.conversation_id,token);
  const valid=result.conversationId===attempt.conversation_id&&result.basketId===attempt.basket_id&&result.currency===attempt.currency&&sameAmount(result.price,attempt.amount)&&sameAmount(result.paidPrice,attempt.amount)&&result.paymentStatus==="SUCCESS"&&Number(result.fraudStatus)===1&&typeof result.paymentId==="string"&&result.paymentId.length>0&&result.token===token;
  if(!valid)throw new Error("PAYMENT_VERIFICATION_MISMATCH");
  await finalizeAttempt(attempt.id,String(result.paymentId),String(attempt.amount),attempt.currency);return NextResponse.redirect(destination("success"),303);
 }catch(error){await markAttemptFailed(attempt.id,error instanceof Error?error.message:"PAYMENT_VERIFICATION_FAILED");return NextResponse.redirect(destination("failed","verification"),303);}
}
