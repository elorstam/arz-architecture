import{canonicalPrice}from"./signatures.ts";

export type VerifiedPaymentMetadata={paidPrice:string;installment:number;merchantCommissionRate:string;merchantCommissionRateAmount:string;iyziCommissionRateAmount:string;iyziCommissionFee:string;paymentTransactionId:string|null;threeDsStatus:string|null};
const decimal=(value:unknown)=>{const normalized=canonicalPrice(value);if(!/^\d+(?:\.\d+)?$/.test(normalized))throw new Error("PAYMENT_PROVIDER_METADATA_INVALID");return normalized;};
export function verifyCheckoutResult(result:Record<string,unknown>,attempt:{conversation_id:string;basket_id:string;amount:string;currency:string},expectedPaymentId?:string):VerifiedPaymentMetadata{
 const price=decimal(result.price),paidPrice=decimal(result.paidPrice),amount=decimal(attempt.amount),installment=Number(result.installment??1);
 if(result.conversationId!==attempt.conversation_id||result.basketId!==attempt.basket_id||result.currency!==attempt.currency||price!==amount||Number(paidPrice)<Number(amount)||result.paymentStatus!=="SUCCESS"||Number(result.fraudStatus)!==1||typeof result.paymentId!=="string"||!result.paymentId||expectedPaymentId&&String(result.paymentId)!==expectedPaymentId)throw new Error("PAYMENT_VERIFICATION_MISMATCH");
 if(![1,2,3,4,6,9,12].includes(installment))throw new Error("PAYMENT_INSTALLMENT_INVALID");
 const item=Array.isArray(result.itemTransactions)&&result.itemTransactions.length===1&&result.itemTransactions[0]&&typeof result.itemTransactions[0]==="object"?result.itemTransactions[0]as Record<string,unknown>:null;
 return{paidPrice,installment,merchantCommissionRate:decimal(result.merchantCommissionRate??0),merchantCommissionRateAmount:decimal(result.merchantCommissionRateAmount??0),iyziCommissionRateAmount:decimal(result.iyziCommissionRateAmount??0),iyziCommissionFee:decimal(result.iyziCommissionFee??0),paymentTransactionId:item?.paymentTransactionId?String(item.paymentTransactionId):null,threeDsStatus:result.mdStatus==null?null:String(result.mdStatus).slice(0,40)};
}
