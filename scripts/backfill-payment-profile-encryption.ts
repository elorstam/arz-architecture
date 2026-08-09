import{createHash}from"node:crypto";
import{createClient,type PostgrestError}from"@supabase/supabase-js";
import{assertPaymentProfileEncryptionConfigured,encryptPaymentIdentity}from"../lib/payments/payment-profile-encryption.ts";

type LegacyProfile={user_id:string;identity_number:string|null};
const correlation=(value:string)=>createHash("sha256").update(value,"utf8").digest("hex").slice(0,12);
const metadata=(error:PostgrestError)=>({code:error.code,message:error.message,details:error.details,hint:error.hint});

async function main(){
 if(process.env.PAYMENT_PROFILE_BACKFILL_CONFIRM!=="encrypt-and-clear")throw new Error("Set PAYMENT_PROFILE_BACKFILL_CONFIRM=encrypt-and-clear to run the controlled backfill.");
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new Error("Supabase server environment is incomplete.");
 assertPaymentProfileEncryptionConfigured();
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const{data,error}=await db.from("studio_client_payment_billing_profiles").select("user_id,identity_number").is("identity_number_encrypted",null).not("identity_number","is",null).neq("identity_number","");
 if(error){console.error("Payment profile backfill lookup failed.",metadata(error));throw new Error("PAYMENT_PROFILE_BACKFILL_LOOKUP_FAILED");}
 let updated=0;
 for(const row of(data??[])as LegacyProfile[]){
  const identity=String(row.identity_number??"").trim();
  if(!identity)continue;
  const rowCorrelation=correlation(row.user_id);
  if(!/^[0-9]{11}$/.test(identity))throw new Error(`PAYMENT_PROFILE_LEGACY_FORMAT_INVALID row=${rowCorrelation}`);
  const{data:changed,error:updateError}=await db.from("studio_client_payment_billing_profiles").update({identity_number_encrypted:encryptPaymentIdentity(identity),identity_number_last_two:identity.slice(-2),identity_number:null,updated_at:new Date().toISOString()}).eq("user_id",row.user_id).eq("identity_number",identity).is("identity_number_encrypted",null).select("user_id").maybeSingle();
  if(updateError){console.error("Payment profile backfill update failed.",{row:rowCorrelation,...metadata(updateError)});throw new Error(`PAYMENT_PROFILE_BACKFILL_UPDATE_FAILED row=${rowCorrelation}`);}
  if(changed)updated++;
 }
 console.log(`Encrypted payment profiles: ${updated}`);
}

await main().catch(error=>{console.error(error instanceof Error?error.message:"PAYMENT_PROFILE_BACKFILL_FAILED");process.exitCode=1;});
