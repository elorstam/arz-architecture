import"server-only";
import{createClient}from"@supabase/supabase-js";
import{z}from"zod";
import{getStudioContext}from"@/lib/studio/auth/get-studio-context";
import{createStudioServerClient}from"@/lib/studio/supabase/server";
import{getIyzicoConfig}from"@/lib/payments/iyzico/config";
import{retrieveCheckout}from"@/lib/payments/iyzico/client";
import{finalizeAttempt,tokenHash,type PaymentAttempt}from"@/lib/payments/iyzico/repository";
import{verifyCheckoutResult}from"@/lib/payments/iyzico/verification";

type ReconciliationAttempt=PaymentAttempt&{provider_payment_id:string|null;finance_entry_id:string|null;checkout_source:string;public_payment_link_id:string|null};
const admin=()=>{const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error("PAYMENT_DATABASE_NOT_CONFIGURED");return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})};
export async function reconcilePublicPayment(projectId:string,paymentRequestId:string){
 const project=z.uuid().parse(projectId),requestId=z.uuid().parse(paymentRequestId),context=await getStudioContext();if(!context?.user||!context.membership||context.membership.role!=="owner")throw new Error("RECONCILIATION_FORBIDDEN");
 const db=await createStudioServerClient(),{data:request,error:requestError}=await db.from("studio_client_payment_requests").select("id,status,organization_id,project_id").eq("id",requestId).eq("project_id",project).eq("organization_id",context.membership.organization_id).maybeSingle();if(requestError||!request)throw new Error("RECONCILIATION_NOT_FOUND");
 const service=admin(),{data,error}=await service.from("studio_client_payment_attempts").select("id,payment_request_id,conversation_id,basket_id,amount,currency,environment,status,provider_token_hash,provider_checkout_url,provider_payment_id,finance_entry_id,expires_at,checkout_source,public_payment_link_id").eq("payment_request_id",requestId).eq("project_id",project).eq("organization_id",context.membership.organization_id).eq("checkout_source","public_link").order("created_at",{ascending:false}).limit(1).maybeSingle();if(error||!data)throw new Error("RECONCILIATION_NOT_FOUND");const attempt=data as ReconciliationAttempt;
 if(request.status==="paid"&&attempt.status==="succeeded"&&attempt.provider_payment_id&&attempt.finance_entry_id)return"already_verified"as const;
 if(request.status!=="pending"||attempt.status!=="awaiting_payment"||!attempt.provider_token_hash||!attempt.provider_checkout_url||!attempt.public_payment_link_id)throw new Error("RECONCILIATION_NOT_AVAILABLE");
 const config=getIyzicoConfig();if(!config||attempt.environment!=="live"||config.environment!=="live"||!config.livePaymentsEnabled)throw new Error("RECONCILIATION_ENVIRONMENT_MISMATCH");
 let checkout:URL;try{checkout=new URL(attempt.provider_checkout_url);}catch{throw new Error("RECONCILIATION_TOKEN_UNAVAILABLE");}if(checkout.protocol!=="https:"||!(checkout.hostname==="iyzipay.com"||checkout.hostname.endsWith(".iyzipay.com")))throw new Error("RECONCILIATION_TOKEN_UNAVAILABLE");const providerToken=checkout.searchParams.get("token");if(!providerToken||tokenHash(providerToken)!==attempt.provider_token_hash)throw new Error("RECONCILIATION_TOKEN_UNAVAILABLE");
 try{const result=await retrieveCheckout(config,attempt.conversation_id,providerToken);if(result.token!==providerToken)throw new Error("PAYMENT_VERIFICATION_MISMATCH");const metadata=verifyCheckoutResult(result,attempt);await finalizeAttempt(attempt.id,String(result.paymentId),String(attempt.amount),attempt.currency,config.environment,metadata);return"verified"as const;}catch(error){console.error("PAYMENT_RECONCILIATION_FAILURE",{attemptId:attempt.id,paymentRequestId:requestId,code:error instanceof Error?error.message.slice(0,100):"PAYMENT_RECONCILIATION_FAILED"});throw new Error("RECONCILIATION_FAILED");}
}
