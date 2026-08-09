import {NextResponse} from "next/server";
import {z} from "zod";
import {getIyzicoConfig} from "@/lib/payments/iyzico/config";
import {initializeCheckout,IyzicoError} from "@/lib/payments/iyzico/client";
import {authenticatedPayment,claimAttemptInitialization,createOrReuseAttempt,markAttemptFailed,markAwaiting} from "@/lib/payments/iyzico/repository";
import {isCheckoutCustomerProfileComplete} from "@/lib/payments/customer-payment-profile";

export const runtime="nodejs";
const noStore={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
const json=(body:unknown,status:number)=>NextResponse.json(body,{status,headers:noStore});
const amount=(value:unknown)=>Number(String(value));

export async function POST(request:Request,{params}:{params:Promise<{paymentRequestId:string}>}){
 const parsed=z.uuid().safeParse((await params).paymentRequestId);if(!parsed.success)return json({error:"Geçersiz ödeme talebi.",code:"INVALID_PAYMENT_REQUEST"},400);
 const contentLength=Number(request.headers.get("content-length")||0);if(contentLength){const body=await request.json().catch(()=>null);if(!body||typeof body!=="object"||Object.keys(body).length)return json({error:"Geçersiz ödeme isteği.",code:"CLIENT_PAYMENT_FIELDS_REJECTED"},400);}
 const lookup=await authenticatedPayment(parsed.data).catch(()=>null);if(!lookup)return json({error:"Ödeme talebi doğrulanamıyor.",code:"PAYMENT_LOOKUP_UNAVAILABLE"},503);if(lookup.kind==="unauthorized")return json({error:"Yetkisiz.",code:"UNAUTHORIZED"},401);if(lookup.kind==="not_found")return json({error:"Ödeme talebi bulunamadı.",code:"PAYMENT_NOT_FOUND"},404);
 const payment=lookup.payment;if(payment.status==="paid")return json({error:"Bu ödeme zaten tamamlandı.",code:"PAYMENT_ALREADY_PAID"},409);if(payment.status==="cancelled")return json({error:"Bu ödeme talebi iptal edildi.",code:"PAYMENT_CANCELLED"},409);
 const config=getIyzicoConfig();if(!config)return json({error:"Ödeme sağlayıcısı henüz yapılandırılmadı.",code:"PAYMENT_PROVIDER_NOT_CONFIGURED"},503);
 if(!isCheckoutCustomerProfileComplete(payment))return json({error:"Ödeme işlemi için müşteri bilgileriniz eksik. Lütfen ARZ Mimarlık ile iletişime geçin.",code:"CUSTOMER_PAYMENT_PROFILE_INCOMPLETE"},422);
 const names=String(payment.buyer_full_name).trim().split(/\s+/),surname=names.length>1?names.pop()!:names[0],name=names.join(" ")||surname;
 let attempt;
 try{attempt=await createOrReuseAttempt(payment.id,lookup.userId);}catch(error){const code=error instanceof Error?error.message:"PAYMENT_ATTEMPT_FAILED";return json({error:code==="PAYMENT_ALREADY_PAID"?"Bu ödeme zaten tamamlandı.":code==="PAYMENT_CANCELLED"?"Bu ödeme talebi iptal edildi.":"Ödeme başlatılamadı.",code},code.startsWith("PAYMENT_A")||code==="PAYMENT_CANCELLED"?409:503);}
 if(attempt.status==="awaiting_payment"&&attempt.provider_checkout_url&&(!attempt.expires_at||Date.parse(attempt.expires_at)>Date.now()))return json({checkoutUrl:attempt.provider_checkout_url},200);
 if(!await claimAttemptInitialization(attempt.id))return json({error:"Ödeme bağlantısı hazırlanıyor. Lütfen kısa süre sonra tekrar deneyin.",code:"PAYMENT_INITIALIZATION_IN_PROGRESS"},409);
 const price=amount(attempt.amount),ip=(request.headers.get("x-forwarded-for")||"").split(",")[0]?.trim()||"";
 const payload={locale:"tr",conversationId:attempt.conversation_id,price,paidPrice:price,currency:attempt.currency,basketId:attempt.basket_id,paymentGroup:"PRODUCT",callbackUrl:config.callbackUrl,enabledInstallments:[1],buyer:{id:payment.buyer_id,name,surname,identityNumber:payment.buyer_identity_number,email:payment.buyer_email,gsmNumber:payment.buyer_gsm_number,registrationAddress:payment.buyer_registration_address,city:payment.buyer_city,country:payment.buyer_country,zipCode:payment.buyer_zip_code||undefined,ip},billingAddress:{contactName:payment.buyer_full_name,address:payment.buyer_registration_address,city:payment.buyer_city,country:payment.buyer_country,zipCode:payment.buyer_zip_code||undefined},basketItems:[{id:payment.id,price,name:payment.title,category1:"Mimarlık Hizmeti",itemType:"VIRTUAL"}]};
 try{
  const response=await initializeCheckout(config,payload);if(response.conversationId!==attempt.conversation_id||typeof response.token!=="string")throw new IyzicoError("PAYMENT_PROVIDER_RESPONSE_INVALID");
  const checkout=new URL(String(response.paymentPageUrl));if(checkout.protocol!=="https:"||!(checkout.hostname==="iyzipay.com"||checkout.hostname.endsWith(".iyzipay.com")))throw new IyzicoError("PAYMENT_PROVIDER_URL_INVALID");
  await markAwaiting(attempt.id,response.token,checkout.toString());return json({checkoutUrl:checkout.toString()},200);
 }catch(error){const code=error instanceof IyzicoError?error.code:"PAYMENT_INITIALIZE_FAILED";await markAttemptFailed(attempt.id,code);return json({error:"Online ödeme başlatılamadı. Lütfen tekrar deneyin.",code:"PAYMENT_INITIALIZE_FAILED"},502);}
}
