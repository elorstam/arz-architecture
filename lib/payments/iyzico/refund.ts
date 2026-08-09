import"server-only";
import{randomUUID}from"node:crypto";
import{createClient}from"@supabase/supabase-js";
import{createStudioServerClient}from"@/lib/studio/supabase/server";
import{getIyzicoConfig}from"./config";
import{refundPayment}from"./client";
import{canonicalPrice}from"./signatures";

type RefundRow={id:string;status:"created"|"processing"|"succeeded"|"failed";environment:"sandbox"|"live";conversation_id:string;provider_payment_id:string;provider_refund_amount:string;currency:string};
function admin(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error("PAYMENT_DATABASE_NOT_CONFIGURED");return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});}
export async function refundStudioPaymentRequest(projectId:string,paymentRequestId:string){
 const db=await createStudioServerClient(),conversationId=`arz-refund-${randomUUID()}`,{data,error}=await db.rpc("studio_claim_iyzico_full_refund",{p_project_id:projectId,p_payment_request_id:paymentRequestId,p_conversation_id:conversationId});
 if(error)throw new Error(error.code==="42501"?"REFUND_FORBIDDEN":"REFUND_NOT_AVAILABLE");const refund=(Array.isArray(data)?data[0]:data)as RefundRow|undefined;if(!refund)throw new Error("REFUND_NOT_AVAILABLE");
 if(refund.status==="succeeded")return"already_refunded"as const;if(refund.status!=="created")throw new Error("REFUND_ALREADY_PROCESSING");
 const config=getIyzicoConfig();if(!config||config.environment!==refund.environment)throw new Error("REFUND_CONFIGURATION_INVALID");if(config.environment==="live"&&!config.livePaymentsEnabled)throw new Error("LIVE_PAYMENTS_DISABLED");
 const service=admin(),{data:claimed,error:claimError}=await service.from("studio_client_payment_refunds").update({status:"processing",updated_at:new Date().toISOString()}).eq("id",refund.id).eq("status","created").select("id").maybeSingle();if(claimError||!claimed)throw new Error("REFUND_ALREADY_PROCESSING");
 try{
  const response=await refundPayment(config,{conversationId:refund.conversation_id,paymentId:refund.provider_payment_id,price:String(refund.provider_refund_amount),currency:refund.currency,ip:""});
  if(response.conversationId!==refund.conversation_id||String(response.paymentId)!==refund.provider_payment_id||canonicalPrice(response.price)!==canonicalPrice(refund.provider_refund_amount)||response.currency!==refund.currency)throw new Error("REFUND_VERIFICATION_MISMATCH");
  const{data:finalized,error:finalizeError}=await service.rpc("iyzico_finalize_full_refund",{p_refund_id:refund.id,p_provider_payment_id:refund.provider_payment_id,p_refund_amount:refund.provider_refund_amount,p_currency:refund.currency,p_environment:refund.environment,p_provider_refund_reference:response.refundHostReference?String(response.refundHostReference):null});if(finalizeError||!finalized)throw new Error("REFUND_FINALIZATION_FAILED");return"refunded"as const;
 }catch(error){await service.rpc("iyzico_fail_refund",{p_refund_id:refund.id,p_error_code:error instanceof Error?error.message:"REFUND_FAILED"});throw error;}
}
