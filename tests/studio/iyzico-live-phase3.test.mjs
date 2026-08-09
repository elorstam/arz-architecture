import assert from"node:assert/strict";
import{createHmac,randomBytes}from"node:crypto";
import{readFileSync}from"node:fs";
import test from"node:test";
import{resolveIyzicoEnvironment}from"../../lib/payments/iyzico/environment.ts";
import{iyzicoWebhookV3Signature,verifyIyzicoWebhookV3}from"../../lib/payments/iyzico/signatures.ts";
import{decryptCheckoutPaymentIdentity,decryptPaymentIdentity,encryptPaymentIdentity}from"../../lib/payments/payment-profile-encryption.ts";

const read=path=>readFileSync(path,"utf8"),migration=read("supabase/migrations/049_iyzico_live_and_payment_profile_encryption.sql"),grantMigration=read("supabase/migrations/050_payment_profile_service_role_backfill_grants.sql"),backfill=read("scripts/backfill-payment-profile-encryption.ts"),checkout=read("app/api/client/payments/[paymentRequestId]/checkout/route.ts"),callback=read("app/api/client/payments/iyzico/callback/route.ts"),webhook=read("app/api/payments/iyzico/webhook/route.ts"),repository=read("lib/payments/iyzico/repository.ts"),profileRepository=read("lib/studio/client-access/client-payment-profile.ts"),env=read(".env.example");
const callbackUrl="https://client.arzmimarlik.net/api/client/payments/iyzico/callback";

test("sandbox and live resolve only to their exact official hosts",()=>{
 assert.equal(resolveIyzicoEnvironment({IYZICO_ENVIRONMENT:"sandbox",IYZICO_SANDBOX_API_KEY:"a",IYZICO_SANDBOX_SECRET_KEY:"s"})?.baseUrl,"https://sandbox-api.iyzipay.com");
 assert.equal(resolveIyzicoEnvironment({IYZICO_ENVIRONMENT:"live",IYZICO_LIVE_API_KEY:"a",IYZICO_LIVE_SECRET_KEY:"s"})?.baseUrl,"https://api.iyzipay.com");
 assert.equal(resolveIyzicoEnvironment({IYZICO_ENVIRONMENT:"live",IYZICO_LIVE_API_KEY:"a",IYZICO_LIVE_SECRET_KEY:"s",IYZICO_BASE_URL:"https://sandbox-api.iyzipay.com"}),null);
 assert.equal(resolveIyzicoEnvironment({IYZICO_ENVIRONMENT:"sandbox",IYZICO_SANDBOX_API_KEY:"a",IYZICO_SANDBOX_SECRET_KEY:"s",IYZICO_BASE_URL:"https://api.iyzipay.com"}),null);
 assert.equal(resolveIyzicoEnvironment({IYZICO_ENVIRONMENT:"live",IYZICO_LIVE_API_KEY:"",IYZICO_LIVE_SECRET_KEY:""}),null);
});

test("live enablement is explicit and defaults closed",()=>{
 assert.equal(resolveIyzicoEnvironment({IYZICO_ENVIRONMENT:"live",IYZICO_LIVE_API_KEY:"a",IYZICO_LIVE_SECRET_KEY:"s"})?.livePaymentsEnabled,false);
 assert.equal(resolveIyzicoEnvironment({IYZICO_ENVIRONMENT:"live",IYZICO_LIVE_API_KEY:"a",IYZICO_LIVE_SECRET_KEY:"s",IYZICO_LIVE_PAYMENTS_ENABLED:"true"})?.livePaymentsEnabled,true);
 assert.match(checkout,/environment==="live"&&!config\.livePaymentsEnabled/);
 assert.match(checkout,/LIVE_PAYMENTS_DISABLED/);
 assert.doesNotMatch(env,/NEXT_PUBLIC_(?:IYZICO|PAYMENT_PROFILE)/);
 for(const name of["IYZICO_ENVIRONMENT","IYZICO_LIVE_API_KEY","IYZICO_LIVE_SECRET_KEY","IYZICO_LIVE_PAYMENTS_ENABLED","PAYMENT_PROFILE_ENCRYPTION_KEY"])assert.match(env,new RegExp(`^${name}=`,"m"));
});

test("attempt creation and finalization are bound to the configured environment",()=>{
 assert.match(repository,/p_environment:environment/);
 assert.match(callback,/attempt\.environment!==config\.environment/);
 assert.match(webhook,/attempt\.environment!==config\.environment/);
 assert.match(repository,/iyzico_finalize_payment_v3/);
 assert.match(migration,/environment<>p_environment/);
 assert.match(migration,/v_environment<>p_environment/);
 assert.match(migration,/return public\.iyzico_finalize_payment/);
});

test("official hosted-payment webhook V3 ordering is verified before retrieve",()=>{
 const secret="secret",payload={iyziEventType:"CHECKOUT_FORM_AUTH",iyziPaymentId:"123",token:"token",paymentConversationId:"conversation",status:"SUCCESS"};
 const expected=createHmac("sha256",secret).update(secret+payload.iyziEventType+payload.iyziPaymentId+payload.token+payload.paymentConversationId+payload.status).digest("hex");
 assert.equal(iyzicoWebhookV3Signature(secret,payload),expected);
 assert.equal(verifyIyzicoWebhookV3(secret,payload,expected),true);
 assert.equal(verifyIyzicoWebhookV3(secret,payload,"bad"),false);
 assert.ok(webhook.indexOf("if(!verifyIyzicoWebhookV3")<webhook.indexOf("const attempt=await attemptForToken"));
 assert.match(webhook,/verifyCheckoutResult\(result,attempt/);
 assert.match(webhook,/attempt\.status==="succeeded"/);
});

test("identity numbers use authenticated encryption and are never projected as plaintext",()=>{
 const prior=process.env.PAYMENT_PROFILE_ENCRYPTION_KEY;process.env.PAYMENT_PROFILE_ENCRYPTION_KEY=randomBytes(32).toString("base64");
 try{const encrypted=encryptPaymentIdentity("12345678901");assert.notEqual(encrypted,"12345678901");assert.equal(decryptPaymentIdentity(encrypted),"12345678901");assert.match(encrypted,/^v1\./);}finally{if(prior===undefined)delete process.env.PAYMENT_PROFILE_ENCRYPTION_KEY;else process.env.PAYMENT_PROFILE_ENCRYPTION_KEY=prior;}
 assert.match(profileRepository,/encryptPaymentIdentity/);
 assert.match(migration,/identity_number_encrypted text/);
 assert.match(migration,/repeat\('\*',9\)/);
 assert.match(migration,/null::text/);
 assert.match(migration,/revoke all on function public\.studio_upsert_client_payment_billing_profile/);
 assert.match(repository,/decryptCheckoutPaymentIdentity/);
});

test("checkout decrypts a cleared encrypted identity before completeness validation",()=>{
 const prior=process.env.PAYMENT_PROFILE_ENCRYPTION_KEY;process.env.PAYMENT_PROFILE_ENCRYPTION_KEY=randomBytes(32).toString("base64");
 try{const encrypted=encryptPaymentIdentity("12345678901");assert.equal(decryptCheckoutPaymentIdentity(encrypted,"01"),"12345678901");assert.throws(()=>decryptCheckoutPaymentIdentity(encrypted,"02"),/PAYMENT_PROFILE_DECRYPT_FAILED/);assert.throws(()=>decryptCheckoutPaymentIdentity("*********01","01"),/PAYMENT_PROFILE_DECRYPT_FAILED/);}finally{if(prior===undefined)delete process.env.PAYMENT_PROFILE_ENCRYPTION_KEY;else process.env.PAYMENT_PROFILE_ENCRYPTION_KEY=prior;}
 assert.match(repository,/identity_number,identity_number_encrypted,identity_number_last_two/);
 assert.match(repository,/buyer_identity_number:identity/);
 assert.ok(checkout.indexOf("isCheckoutCustomerProfileComplete(payment)")<checkout.indexOf('config.environment==="live"&&!config.livePaymentsEnabled'));
});

test("missing and wrong encryption keys fail closed with safe server codes",()=>{
 const prior=process.env.PAYMENT_PROFILE_ENCRYPTION_KEY;delete process.env.PAYMENT_PROFILE_ENCRYPTION_KEY;
 try{assert.throws(()=>decryptCheckoutPaymentIdentity("v1.a.b.c","01"),/PAYMENT_PROFILE_ENCRYPTION_KEY_MISSING/);process.env.PAYMENT_PROFILE_ENCRYPTION_KEY=randomBytes(32).toString("base64");const encrypted=encryptPaymentIdentity("12345678901");process.env.PAYMENT_PROFILE_ENCRYPTION_KEY=randomBytes(32).toString("base64");assert.throws(()=>decryptCheckoutPaymentIdentity(encrypted,"01"),/PAYMENT_PROFILE_DECRYPT_FAILED/);}finally{if(prior===undefined)delete process.env.PAYMENT_PROFILE_ENCRYPTION_KEY;else process.env.PAYMENT_PROFILE_ENCRYPTION_KEY=prior;}
 assert.match(checkout,/PAYMENT_PROFILE_UNAVAILABLE/);
 assert.match(repository,/PAYMENT_PROFILE_ENCRYPTION_KEY_MISSING/);
 assert.doesNotMatch(checkout,/buyer_identity_number.*checkoutError|identity_number.*checkoutError/);
});

test("controlled backfill uses minimum service-role grants and remains retry safe",()=>{
 assert.match(grantMigration,/grant select,update on table public\.studio_client_payment_billing_profiles to service_role/);
 assert.match(backfill,/PAYMENT_PROFILE_BACKFILL_CONFIRM!=="encrypt-and-clear"/);
 assert.match(backfill,/assertPaymentProfileEncryptionConfigured/);
 assert.match(backfill,/\.is\("identity_number_encrypted",null\)/);
 assert.match(backfill,/\.neq\("identity_number",""\)/);
 assert.match(backfill,/\.eq\("identity_number",identity\)\.is\("identity_number_encrypted",null\)/);
 assert.match(backfill,/code:error\.code,message:error\.message,details:error\.details,hint:error\.hint/);
 assert.doesNotMatch(backfill,/console\.(?:log|error)\([^\n]*(?:identity|SUPABASE_SERVICE_ROLE_KEY|PAYMENT_PROFILE_ENCRYPTION_KEY)/);
});

test("callback contract and public URLs remain server controlled",()=>{
 assert.match(env,new RegExp(`IYZICO_CALLBACK_URL=${callbackUrl.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}`));
 assert.match(callback,/retrieveCheckout/);
 assert.match(callback,/verifyCheckoutResult\(result,attempt\)/);
 assert.match(webhook,/runtime="nodejs"/);
 assert.doesNotMatch(webhook,/auth\.getUser|buyer_|identity_number|apiKey|Authorization/);
});
