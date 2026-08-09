import "server-only";
import {z}from"zod";
import{IYZICO_ENVIRONMENT_URLS,resolveIyzicoEnvironment}from"./environment";

export type{IyzicoEnvironment}from"./environment";
const HOSTS={sandbox:new URL(IYZICO_ENVIRONMENT_URLS.sandbox).hostname,live:new URL(IYZICO_ENVIRONMENT_URLS.live).hostname}as const;
const schema=z.object({environment:z.enum(["sandbox","live"]),apiKey:z.string().min(1),secretKey:z.string().min(1),baseUrl:z.url(),callbackUrl:z.url(),livePaymentsEnabled:z.boolean()});
export type IyzicoConfig=z.infer<typeof schema>;

export function iyzicoConfigStatus(){
 const environment=process.env.IYZICO_ENVIRONMENT;
 const selected=environment==="live"?"live":environment==="sandbox"?"sandbox":null;
 const baseUrl=process.env.IYZICO_BASE_URL||(selected?IYZICO_ENVIRONMENT_URLS[selected]:undefined);
 let hostClassification="invalid";try{const host=new URL(baseUrl??"").hostname;hostClassification=host===HOSTS.sandbox?"sandbox":host===HOSTS.live?"live":"other";}catch{}
 const apiKey=selected==="live"?process.env.IYZICO_LIVE_API_KEY:selected==="sandbox"?(process.env.IYZICO_SANDBOX_API_KEY||process.env.IYZICO_API_KEY):undefined;
 const secretKey=selected==="live"?process.env.IYZICO_LIVE_SECRET_KEY:selected==="sandbox"?(process.env.IYZICO_SANDBOX_SECRET_KEY||process.env.IYZICO_SECRET_KEY):undefined;
 return{environment:environment??"missing",apiKeyConfigured:Boolean(apiKey),secretKeyConfigured:Boolean(secretKey),baseUrlConfigured:Boolean(baseUrl),callbackUrlConfigured:Boolean(process.env.IYZICO_CALLBACK_URL),hostClassification,livePaymentsEnabled:process.env.IYZICO_LIVE_PAYMENTS_ENABLED?.trim().toLowerCase()==="true"};
}

export function getIyzicoConfig():IyzicoConfig|null{
 const resolved=resolveIyzicoEnvironment(process.env);
 const parsed=schema.safeParse({...resolved,callbackUrl:process.env.IYZICO_CALLBACK_URL});
 if(!parsed.success)return null;
 const callback=new URL(parsed.data.callbackUrl);
 if(callback.protocol!=="https:")return null;
 return parsed.data;
}
