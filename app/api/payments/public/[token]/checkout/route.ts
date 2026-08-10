import{NextResponse}from"next/server";
import{getIyzicoConfig,iyzicoConfigStatus}from"@/lib/payments/iyzico/config";
import{initializeCheckout,IyzicoError}from"@/lib/payments/iyzico/client";
import{claimAttemptInitialization,createOrReuseAttempt,markAttemptFailed,markAwaiting}from"@/lib/payments/iyzico/repository";
import{isCheckoutCustomerProfileComplete}from"@/lib/payments/customer-payment-profile";
import{isReusableInitializedCheckout}from"@/lib/payments/iyzico/checkout-attempt";
import{attachAttemptToPublicLink,resolvePublicPayment}from"@/lib/payments/public-links";
import{checkPublicPaymentRateLimit}from"@/lib/payments/public-rate-limit";
import{isAllowedPublicPaymentRequest,isLocalHostname,scopeForHostname}from"@/lib/routing/app-domains";
import{appBaseUrl}from"@/lib/routing/app-domains";
import{buildIyzicoCheckoutPayload,checkoutConfigFingerprint}from"@/lib/payments/iyzico/checkout-payload";

export const runtime="nodejs";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","X-Robots-Tag":"noindex, nofollow"};
const json=(body:unknown,status:number)=>NextResponse.json(body,{status,headers});
export async function POST(request:Request,{params}:{params:Promise<{token:string}>}){
 const token=(await params).token,host=request.headers.get("x-forwarded-host")||request.headers.get("host"),protocol=request.headers.get("x-forwarded-proto")||new URL(request.url).protocol.replace(":",""),scope=scopeForHostname(host),ip=(request.headers.get("x-forwarded-for")||request.headers.get("x-real-ip")||"unknown").split(",")[0].trim();
 if(!isAllowedPublicPaymentRequest(host,protocol))return json({error:"Bu ödeme bağlantısı artık geçerli değil."},404);
 if(scope!=="public"&&scope!=="local"||!isLocalHostname(host)&&new URL(request.url).protocol!=="https:")return json({error:"Bu ödeme bağlantısı artık geçerli değil."},404);
 if(!checkPublicPaymentRateLimit(`${ip}:${token.slice(0,8)}`))return json({error:"Lütfen kısa süre sonra tekrar deneyin."},429);
 const contentLength=Number(request.headers.get("content-length")||0);if(contentLength){const body=await request.json().catch(()=>null);if(!body||typeof body!=="object"||Object.keys(body).length)return json({error:"Geçersiz ödeme isteği."},400);}
 const resolved=await resolvePublicPayment(token).catch(()=>null);if(!resolved)return json({error:"Bu ödeme bağlantısı artık geçerli değil."},404);const payment=resolved.payment;
 if(resolved.linkStatus==="paid"||payment.status==="paid")return json({error:"Bu ödeme tamamlanmış."},409);if(resolved.linkStatus!=="active"||new Date(resolved.expiresAt)<=new Date()||payment.status!=="pending"||Number(payment.amount)<=0)return json({error:"Bu ödeme bağlantısı artık geçerli değil."},404);
 if(!isCheckoutCustomerProfileComplete(payment))return json({error:"Ödeme için gerekli müşteri bilgileri eksik."},422);
 const config=getIyzicoConfig();if(!config)return json({error:"Ödeme sağlayıcısı henüz yapılandırılmadı.",code:"PAYMENT_PROVIDER_NOT_CONFIGURED",configuration:iyzicoConfigStatus()},503);if(config.environment==="live"&&!config.livePaymentsEnabled)return json({error:"Canlı ödeme sistemi henüz etkinleştirilmedi."},503);
 const configFingerprint=checkoutConfigFingerprint(config.enabledInstallments);let attempt;try{attempt=await createOrReuseAttempt(payment.id,resolved.createdBy,config.environment,configFingerprint,config.enabledInstallments);if(attempt.wasCreated)await attachAttemptToPublicLink(attempt.id,resolved.linkId);}catch(error){const code=error instanceof Error?error.message:"PAYMENT_ATTEMPT_FAILED";return json({error:code==="PAYMENT_ALREADY_PAID"?"Bu ödeme tamamlanmış.":"Ödeme başlatılamadı."},code==="PAYMENT_ALREADY_PAID"?409:503);}
 if(!attempt.configMatches)return json({error:"Mevcut ödeme oturumunun süresi dolduktan sonra tekrar deneyin.",code:"PAYMENT_CHECKOUT_CONFIG_CHANGED"},409);if(isReusableInitializedCheckout(attempt))return json({checkoutUrl:attempt.provider_checkout_url},200);if(!await claimAttemptInitialization(attempt.id))return json({error:"Ödeme bağlantısı hazırlanıyor. Lütfen kısa süre sonra tekrar deneyin."},409);
 const callbackUrl=new URL(`/api/payments/public/${encodeURIComponent(token)}/callback`,appBaseUrl("public"));
 const payload=buildIyzicoCheckoutPayload({payment,attempt,callbackUrl:callbackUrl.toString(),enabledInstallments:config.enabledInstallments,ip});
 try{const response=await initializeCheckout(config,payload);if(response.conversationId!==attempt.conversation_id||typeof response.token!=="string")throw new IyzicoError("PAYMENT_PROVIDER_RESPONSE_INVALID");const checkout=new URL(String(response.paymentPageUrl));if(checkout.protocol!=="https:"||!(checkout.hostname==="iyzipay.com"||checkout.hostname.endsWith(".iyzipay.com")))throw new IyzicoError("PAYMENT_PROVIDER_URL_INVALID");await markAwaiting(attempt.id,response.token,checkout.toString());return json({checkoutUrl:checkout.toString()},200);}catch(error){await markAttemptFailed(attempt.id,error instanceof IyzicoError?error.code:"PAYMENT_INITIALIZE_FAILED");return json({error:"Ödeme başlatılamadı."},502);}
}
