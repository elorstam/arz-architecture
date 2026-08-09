import {createHmac,timingSafeEqual} from "node:crypto";

export const INITIALIZE_PATH="/payment/iyzipos/checkoutform/initialize/auth/ecom";
export const RETRIEVE_PATH="/payment/iyzipos/checkoutform/auth/ecom/detail";

export function iyzicoAuthorization(apiKey:string,secretKey:string,randomKey:string,path:string,body:string){
 const signature=createHmac("sha256",secretKey).update(randomKey+path+body,"utf8").digest("hex");
 const encoded=Buffer.from(`apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`,"utf8").toString("base64");
 return `IYZWSv2 ${encoded}`;
}
export function canonicalPrice(value:unknown){const raw=String(value??"");if(!/^\d+(?:\.\d+)?$/.test(raw))return raw;return raw.replace(/(\.\d*?)0+$/,"$1").replace(/\.$/,"");}
export function responseSignature(secretKey:string,values:unknown[]){return createHmac("sha256",secretKey).update(values.map(value=>String(value??"")).join(":"),"utf8").digest("hex");}
export function safeSignatureEqual(actual:unknown,expected:string){if(typeof actual!=="string"||!actual)return false;const a=Buffer.from(actual,"utf8"),b=Buffer.from(expected,"utf8");return a.length===b.length&&timingSafeEqual(a,b);}
export function verifyInitializeSignature(secretKey:string,response:Record<string,unknown>){return safeSignatureEqual(response.signature,responseSignature(secretKey,[response.conversationId,response.token]));}
export function verifyRetrieveSignature(secretKey:string,response:Record<string,unknown>){return safeSignatureEqual(response.signature,responseSignature(secretKey,[response.paymentStatus,response.paymentId,response.currency,response.basketId,response.conversationId,canonicalPrice(response.paidPrice),canonicalPrice(response.price),response.token]));}
