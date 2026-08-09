import "server-only";
import {randomBytes} from "node:crypto";
import type {IyzicoConfig} from "./config";
import {INITIALIZE_PATH,RETRIEVE_PATH,iyzicoAuthorization,verifyInitializeSignature,verifyRetrieveSignature} from "./signatures";

export type IyzicoResponse=Record<string,unknown>;
export class IyzicoError extends Error{constructor(public code:string){super(code);}}

async function call(config:IyzicoConfig,path:string,payload:Record<string,unknown>){
 const body=JSON.stringify(payload),randomKey=`${Date.now()}${randomBytes(12).toString("hex")}`;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{
  const response=await fetch(`${config.baseUrl}${path}`,{method:"POST",headers:{Authorization:iyzicoAuthorization(config.apiKey,config.secretKey,randomKey,path,body),"x-iyzi-rnd":randomKey,"Content-Type":"application/json"},body,cache:"no-store",signal:controller.signal});
  const result=await response.json().catch(()=>null) as IyzicoResponse|null;
  if(!response.ok||!result)throw new IyzicoError("PAYMENT_PROVIDER_UNAVAILABLE");
  return result;
 }catch(error){if(error instanceof IyzicoError)throw error;throw new IyzicoError("PAYMENT_PROVIDER_UNAVAILABLE");}finally{clearTimeout(timer);}
}

export async function initializeCheckout(config:IyzicoConfig,payload:Record<string,unknown>){const response=await call(config,INITIALIZE_PATH,payload);if(response.status!=="success")throw new IyzicoError(String(response.errorCode||"PAYMENT_INITIALIZE_FAILED"));if(!verifyInitializeSignature(config.secretKey,response))throw new IyzicoError("PAYMENT_PROVIDER_SIGNATURE_INVALID");return response;}
export async function retrieveCheckout(config:IyzicoConfig,conversationId:string,token:string){const response=await call(config,RETRIEVE_PATH,{locale:"tr",conversationId,token});if(response.status!=="success")throw new IyzicoError(String(response.errorCode||"PAYMENT_RETRIEVE_FAILED"));if(!verifyRetrieveSignature(config.secretKey,response))throw new IyzicoError("PAYMENT_PROVIDER_SIGNATURE_INVALID");return response;}
