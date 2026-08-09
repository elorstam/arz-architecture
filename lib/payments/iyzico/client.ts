import "server-only";
import {randomBytes} from "node:crypto";
import type {IyzicoConfig} from "./config";
import {INITIALIZE_PATH,REFUND_V2_PATH,RETRIEVE_PATH,iyzicoAuthorization,verifyInitializeSignature,verifyRefundSignature,verifyRetrieveSignature} from "./signatures";

export type IyzicoResponse=Record<string,unknown>;
export type IyzicoErrorDetails={stage:string;httpStatus?:number;providerStatus?:string;providerErrorCode?:string;providerErrorMessage?:string;exceptionName?:string;exceptionMessage?:string};
export class IyzicoError extends Error{constructor(public code:string,public details:IyzicoErrorDetails={stage:"iyzico_unknown"}){super(code);this.name="IyzicoError";}}

const safeText=(value:unknown,max=300)=>typeof value==="string"?value.replace(/[\r\n\t]/g," ").slice(0,max):undefined;
const operation=(path:string)=>path===INITIALIZE_PATH?"initialize":path===REFUND_V2_PATH?"refund":"retrieve";
function providerFields(result:IyzicoResponse|null){return{providerStatus:safeText(result?.status,60),providerErrorCode:safeText(result?.errorCode,100),providerErrorMessage:safeText(result?.errorMessage,300)};}
function logFailure(details:IyzicoErrorDetails&{code:string}){console.error("IYZICO_PAYMENT_FAILURE",details);}

async function call(config:IyzicoConfig,path:string,payload:Record<string,unknown>){
 const body=JSON.stringify(payload),randomKey=`${Date.now()}${randomBytes(12).toString("hex")}`;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{
  if(path===INITIALIZE_PATH){const enabledInstallments=Array.isArray(payload.enabledInstallments)?payload.enabledInstallments.filter(value=>Number.isInteger(value)).map(Number):[];console.info("IYZICO_INITIALIZE_INSTALLMENTS",{enabledInstallments});}
  const response=await fetch(`${config.baseUrl}${path}`,{method:"POST",headers:{Authorization:iyzicoAuthorization(config.apiKey,config.secretKey,randomKey,path,body),"x-iyzi-rnd":randomKey,"Content-Type":"application/json"},body,cache:"no-store",signal:controller.signal});
  const result=await response.json().catch(()=>null) as IyzicoResponse|null;
  if(!response.ok||!result){const details={stage:`iyzico_${operation(path)}_http`,httpStatus:response.status,...providerFields(result)};logFailure({code:"PAYMENT_PROVIDER_UNAVAILABLE",...details});throw new IyzicoError("PAYMENT_PROVIDER_UNAVAILABLE",details);}
  return result;
 }catch(error){if(error instanceof IyzicoError)throw error;const details={stage:`iyzico_${operation(path)}_request`,exceptionName:error instanceof Error?error.name:"unknown",exceptionMessage:safeText(error instanceof Error?error.message:String(error))};logFailure({code:"PAYMENT_PROVIDER_UNAVAILABLE",...details});throw new IyzicoError("PAYMENT_PROVIDER_UNAVAILABLE",details);}finally{clearTimeout(timer);}
}

export async function initializeCheckout(config:IyzicoConfig,payload:Record<string,unknown>){const response=await call(config,INITIALIZE_PATH,payload);if(response.status!=="success"){const code=String(response.errorCode||"PAYMENT_INITIALIZE_FAILED"),details={stage:"iyzico_initialize_provider_failure",...providerFields(response)};logFailure({code,...details});throw new IyzicoError(code,details);}if(!verifyInitializeSignature(config.secretKey,response)){const details={stage:"iyzico_initialize_signature",providerStatus:safeText(response.status,60)};logFailure({code:"PAYMENT_PROVIDER_SIGNATURE_INVALID",...details});throw new IyzicoError("PAYMENT_PROVIDER_SIGNATURE_INVALID",details);}return response;}
export async function retrieveCheckout(config:IyzicoConfig,conversationId:string,token:string){const response=await call(config,RETRIEVE_PATH,{locale:"tr",conversationId,token});if(response.status!=="success")throw new IyzicoError(String(response.errorCode||"PAYMENT_RETRIEVE_FAILED"));if(!verifyRetrieveSignature(config.secretKey,response))throw new IyzicoError("PAYMENT_PROVIDER_SIGNATURE_INVALID");return response;}
export async function refundPayment(config:IyzicoConfig,payload:{conversationId:string;paymentId:string;price:string;currency:string;ip?:string}){const response=await call(config,REFUND_V2_PATH,{locale:"tr",...payload,ip:payload.ip||undefined});if(response.status!=="success")throw new IyzicoError(String(response.errorCode||"PAYMENT_REFUND_FAILED"));if(!verifyRefundSignature(config.secretKey,response))throw new IyzicoError("PAYMENT_PROVIDER_SIGNATURE_INVALID");return response;}
