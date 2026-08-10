import "server-only";
import {createHash,randomBytes} from "node:crypto";
import {createClient} from "@supabase/supabase-js";
import {z} from "zod";
import {appBaseUrl} from "@/lib/routing/app-domains";
import {encryptPaymentIdentity,decryptCheckoutPaymentIdentity} from "@/lib/payments/payment-profile-encryption";
import {createStudioServerClient} from "@/lib/studio/supabase/server";
import type {CheckoutPayment} from "@/lib/payments/iyzico/repository";

export type PublicLinkStatus="active"|"paid"|"revoked"|"expired";
export type StudioPublicPaymentLink={paymentRequestId:string;id:string;status:PublicLinkStatus;expiresAt:string;lastOpenedAt:string|null;paidAt:string|null;buyerFullName:string;buyerEmail:string;buyerGsmNumber:string;buyerIdentityNumberMasked:string;buyerRegistrationAddress:string;buyerCity:string;buyerCountry:string;buyerZipCode:string};
export type ResolvedPublicPayment={linkId:string;createdBy:string;expiresAt:string;linkStatus:PublicLinkStatus;payment:CheckoutPayment};

const profileSchema=z.object({firstName:z.string().trim().min(1).max(80),lastName:z.string().trim().min(1).max(80),email:z.email(),gsmNumber:z.string().trim().regex(/^\+?[0-9 ()-]{10,20}$/),identityNumber:z.string().trim().regex(/^\d{11}$/),registrationAddress:z.string().trim().min(5).max(500),city:z.string().trim().min(2).max(100),country:z.string().trim().min(2).max(100),zipCode:z.string().trim().max(20).optional().default("")});
const linkSchema=z.object({paymentRequestId:z.uuid(),expiresAt:z.iso.datetime(),profile:profileSchema});
const sha256=(token:string)=>createHash("sha256").update(token,"utf8").digest("hex");
const admin=()=>{const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error("PAYMENT_DATABASE_NOT_CONFIGURED");return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})};
export const createPublicPaymentToken=()=>randomBytes(32).toString("base64url");
export const publicPaymentUrl=(token:string)=>`${appBaseUrl("public")}/odeme/${encodeURIComponent(token)}`;

export async function listStudioPublicPaymentLinks(projectId:string){
 const db=await createStudioServerClient(),{data,error}=await db.rpc("studio_list_public_payment_links",{p_project_id:z.uuid().parse(projectId)});if(error){if(["PGRST202","42P01"].includes(error.code))return[];throw error;}
 return ((data??[])as Record<string,unknown>[]).map(row=>({paymentRequestId:String(row.payment_request_id),id:String(row.link_id),status:String(row.status)as PublicLinkStatus,expiresAt:String(row.expires_at),lastOpenedAt:row.last_opened_at?String(row.last_opened_at):null,paidAt:row.paid_at?String(row.paid_at):null,buyerFullName:String(row.buyer_full_name),buyerEmail:String(row.buyer_email),buyerGsmNumber:String(row.buyer_gsm_number),buyerIdentityNumberMasked:String(row.buyer_identity_number_masked),buyerRegistrationAddress:String(row.buyer_registration_address),buyerCity:String(row.buyer_city),buyerCountry:String(row.buyer_country),buyerZipCode:String(row.buyer_zip_code??"")}));
}

export async function createStudioPublicPaymentLink(projectId:string,input:unknown){
 const value=linkSchema.parse(input);if(Date.parse(value.expiresAt)<=Date.now())throw new Error("LINK_EXPIRY_INVALID");const token=createPublicPaymentToken(),encrypted=encryptPaymentIdentity(value.profile.identityNumber),db=await createStudioServerClient();
 const{error}=await db.rpc("studio_create_public_payment_link",{p_project_id:z.uuid().parse(projectId),p_payment_request_id:value.paymentRequestId,p_token_hash:sha256(token),p_expires_at:value.expiresAt,p_buyer_full_name:`${value.profile.firstName} ${value.profile.lastName}`,p_buyer_email:value.profile.email,p_buyer_gsm_number:value.profile.gsmNumber,p_buyer_identity_number_encrypted:encrypted,p_buyer_identity_number_last_two:value.profile.identityNumber.slice(-2),p_buyer_registration_address:value.profile.registrationAddress,p_buyer_city:value.profile.city,p_buyer_country:value.profile.country,p_buyer_zip_code:value.profile.zipCode||null});if(error)throw error;
 return{url:publicPaymentUrl(token),expiresAt:value.expiresAt};
}

export async function revokeStudioPublicPaymentLink(projectId:string,paymentRequestId:string){const db=await createStudioServerClient(),{error}=await db.rpc("studio_revoke_public_payment_link",{p_project_id:z.uuid().parse(projectId),p_payment_request_id:z.uuid().parse(paymentRequestId)});if(error)throw error;}

export async function resolvePublicPayment(token:string,markOpened=false):Promise<ResolvedPublicPayment|null>{
 if(!/^[A-Za-z0-9_-]{43}$/.test(token))return null;const db=admin(),now=new Date().toISOString(),{data:link,error}=await db.from("studio_public_payment_links").select("id,organization_id,project_id,payment_request_id,status,expires_at,revoked_at,created_by,buyer_full_name,buyer_email,buyer_gsm_number,buyer_identity_number_encrypted,buyer_identity_number_last_two,buyer_registration_address,buyer_city,buyer_country,buyer_zip_code").eq("token_hash",sha256(token)).maybeSingle();if(error||!link)return null;
 if(link.status==="active"&&link.expires_at<=now){await db.from("studio_public_payment_links").update({status:"expired",updated_at:now}).eq("id",link.id).eq("status","active");link.status="expired";}
 const{data:request,error:requestError}=await db.from("studio_client_payment_requests").select("id,organization_id,project_id,title,amount,currency,status,studio_projects!inner(name)").eq("id",link.payment_request_id).eq("organization_id",link.organization_id).eq("project_id",link.project_id).maybeSingle();if(requestError||!request)return null;
 if(markOpened&&link.status==="active")await db.from("studio_public_payment_links").update({last_opened_at:now,updated_at:now}).eq("id",link.id).eq("status","active");
 let identity:string;try{identity=decryptCheckoutPaymentIdentity(link.buyer_identity_number_encrypted,link.buyer_identity_number_last_two);}catch{return null;}
 const project=Array.isArray(request.studio_projects)?request.studio_projects[0]:request.studio_projects as{ name?:string}|null;
 return{linkId:link.id,createdBy:link.created_by,expiresAt:link.expires_at,linkStatus:link.status as PublicLinkStatus,payment:{id:request.id,organization_id:request.organization_id,project_id:request.project_id,project_name:String(project?.name??"Proje"),title:request.title,amount:String(request.amount),currency:request.currency,status:request.status,buyer_id:link.id,buyer_full_name:link.buyer_full_name,buyer_identity_number:identity,buyer_email:link.buyer_email,buyer_gsm_number:link.buyer_gsm_number,buyer_registration_address:link.buyer_registration_address,buyer_city:link.buyer_city,buyer_country:link.buyer_country,buyer_zip_code:link.buyer_zip_code}};
}

export async function attachAttemptToPublicLink(attemptId:string,linkId:string){const{error}=await admin().from("studio_client_payment_attempts").update({checkout_source:"public_link",public_payment_link_id:linkId,updated_at:new Date().toISOString()}).eq("id",attemptId).neq("status","succeeded");if(error)throw new Error("PAYMENT_ATTEMPT_SOURCE_FAILED");}
