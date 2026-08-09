import{NextResponse}from"next/server";
import{z}from"zod";
import{getIyzicoConfig}from"@/lib/payments/iyzico/config";
import{retrieveCheckout}from"@/lib/payments/iyzico/client";
import{attemptForToken,finalizeAttempt}from"@/lib/payments/iyzico/repository";
import{canonicalPrice,verifyIyzicoWebhookV3}from"@/lib/payments/iyzico/signatures";

export const runtime="nodejs";
const schema=z.object({iyziEventType:z.string().min(1).max(80),iyziPaymentId:z.union([z.string(),z.number()]),token:z.string().min(1).max(2048),paymentConversationId:z.string().min(1).max(200),status:z.string().min(1).max(40)}).passthrough();
const response=(status:number)=>new NextResponse(null,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
const sameAmount=(left:unknown,right:unknown)=>canonicalPrice(left)===canonicalPrice(right);
const failure=(stage:string,fields:Record<string,unknown>={})=>console.error("IYZICO_WEBHOOK_FAILURE",{stage,...fields});

export async function POST(request:Request){
 const length=Number(request.headers.get("content-length")||0);if(length>16384)return response(413);
 const input=schema.safeParse(await request.json().catch(()=>null));if(!input.success)return response(400);
 const config=getIyzicoConfig();if(!config){failure("webhook_configuration");return response(503);}
 const signature=request.headers.get("x-iyz-signature-v3");if(!verifyIyzicoWebhookV3(config.secretKey,input.data,signature)){failure("webhook_signature",{environment:config.environment});return response(401);}
 if(input.data.iyziEventType!=="CHECKOUT_FORM_AUTH")return response(204);
 const attempt=await attemptForToken(input.data.token).catch(()=>null);if(!attempt){failure("webhook_attempt_not_found",{environment:config.environment});return response(404);}
 if(attempt.environment!==config.environment||attempt.conversation_id!==input.data.paymentConversationId){failure("webhook_correlation",{attemptId:attempt.id,conversationId:attempt.conversation_id,environment:config.environment});return response(409);}
 if(input.data.status!=="SUCCESS")return response(204);
 if(attempt.status==="succeeded")return response(204);
 try{
  const result=await retrieveCheckout(config,attempt.conversation_id,input.data.token);
  const valid=result.conversationId===attempt.conversation_id&&result.basketId===attempt.basket_id&&result.currency===attempt.currency&&sameAmount(result.price,attempt.amount)&&sameAmount(result.paidPrice,attempt.amount)&&result.paymentStatus==="SUCCESS"&&Number(result.fraudStatus)===1&&String(result.paymentId)===String(input.data.iyziPaymentId)&&result.token===input.data.token;
  if(!valid){failure("webhook_verification",{attemptId:attempt.id,conversationId:attempt.conversation_id,environment:config.environment});return response(422);}
  await finalizeAttempt(attempt.id,String(result.paymentId),String(attempt.amount),attempt.currency,config.environment);return response(204);
 }catch(error){failure("webhook_retrieve",{attemptId:attempt.id,conversationId:attempt.conversation_id,environment:config.environment,errorType:error instanceof Error?error.name:"unknown"});return response(502);}
}
