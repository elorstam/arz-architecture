import "server-only";
import {z} from "zod";
import {createStudioServerClient} from "@/lib/studio/supabase/server";

export type StudioClientPaymentProfile={userId:string;fullName:string;email:string;gsmNumber:string;identityNumber:string;registrationAddress:string;city:string;country:string;zipCode:string;isComplete:boolean};
type Row={user_id:string;full_name:string|null;email:string|null;gsm_number:string|null;identity_number:string|null;registration_address:string|null;city:string|null;country:string|null;zip_code:string|null;is_complete:boolean};

const phone=z.string().trim().transform(value=>value.replace(/[\s()\-]/g,"")).pipe(z.string().regex(/^\+?[0-9]{10,15}$/));
export const paymentProfileSchema=z.object({firstName:z.string().trim().min(1).max(60),lastName:z.string().trim().min(1).max(60),email:z.email().max(320),gsmNumber:phone,identityNumber:z.string().trim().regex(/^[0-9]{11}$/),registrationAddress:z.string().trim().min(5).max(500),city:z.string().trim().min(2).max(120),country:z.string().trim().min(2).max(120),zipCode:z.string().trim().max(20)});

export async function getStudioClientPaymentProfiles(projectId:string):Promise<StudioClientPaymentProfile[]>{const db=await createStudioServerClient(),{data,error}=await db.rpc("studio_list_client_payment_billing_profiles",{p_project_id:projectId});if(error)throw new Error("client_payment_profiles_unavailable");return((data??[]) as Row[]).map(row=>({userId:row.user_id,fullName:row.full_name??"",email:row.email??"",gsmNumber:row.gsm_number??"",identityNumber:row.identity_number??"",registrationAddress:row.registration_address??"",city:row.city??"",country:row.country??"Turkey",zipCode:row.zip_code??"",isComplete:Boolean(row.is_complete)}));}

export async function saveStudioClientPaymentProfile(projectId:string,clientUserId:string,input:unknown){const value=paymentProfileSchema.parse(input),db=await createStudioServerClient(),{data,error}=await db.rpc("studio_upsert_client_payment_billing_profile",{p_project_id:projectId,p_client_user_id:z.uuid().parse(clientUserId),p_full_name:`${value.firstName} ${value.lastName}`,p_email:value.email,p_gsm_number:value.gsmNumber,p_identity_number:value.identityNumber,p_registration_address:value.registrationAddress,p_city:value.city,p_country:value.country,p_zip_code:value.zipCode||null});if(error||!data)throw new Error(error?.code==="42501"?"forbidden":error?.code==="P0002"?"client_access_not_found":"payment_profile_save_failed");}
