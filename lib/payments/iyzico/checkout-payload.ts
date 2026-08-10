import"server-only";
import{createHash}from"node:crypto";
import type{CheckoutPayment,PaymentAttempt}from"@/lib/payments/iyzico/repository";

export const CHECKOUT_CONFIG_VERSION="installments-v1";
export function checkoutConfigFingerprint(enabledInstallments:number[]){return createHash("sha256").update(JSON.stringify({version:CHECKOUT_CONFIG_VERSION,enabledInstallments}),"utf8").digest("hex")}
export function buildIyzicoCheckoutPayload({payment,attempt,callbackUrl,enabledInstallments,ip}:{payment:CheckoutPayment;attempt:PaymentAttempt;callbackUrl:string;enabledInstallments:number[];ip:string}){
 const names=String(payment.buyer_full_name).trim().split(/\s+/),surname=names.length>1?names.pop()!:names[0],name=names.join(" ")||surname,price=Number(attempt.amount);
 return{locale:"tr",conversationId:attempt.conversation_id,price,paidPrice:price,currency:attempt.currency,basketId:attempt.basket_id,paymentGroup:"PRODUCT",callbackUrl,enabledInstallments,buyer:{id:payment.buyer_id,name,surname,identityNumber:payment.buyer_identity_number,email:payment.buyer_email,gsmNumber:payment.buyer_gsm_number,registrationAddress:payment.buyer_registration_address,city:payment.buyer_city,country:payment.buyer_country,zipCode:payment.buyer_zip_code||undefined,ip},billingAddress:{contactName:payment.buyer_full_name,address:payment.buyer_registration_address,city:payment.buyer_city,country:payment.buyer_country,zipCode:payment.buyer_zip_code||undefined},basketItems:[{id:payment.id,price,name:payment.title,category1:"Mimarlık Hizmeti",itemType:"VIRTUAL"}]};
}
