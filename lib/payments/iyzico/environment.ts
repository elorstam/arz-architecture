export type IyzicoEnvironment="sandbox"|"live";

export const IYZICO_ENVIRONMENT_URLS={
 sandbox:"https://sandbox-api.iyzipay.com",
 live:"https://api.iyzipay.com",
}as const;

export type IyzicoEnvironmentSettings={
 environment:IyzicoEnvironment;
 apiKey:string;
 secretKey:string;
 baseUrl:string;
 livePaymentsEnabled:boolean;
 enabledInstallments:number[];
};

const enabled=(value:string|undefined)=>value?.trim().toLowerCase()==="true";
export const IYZICO_ALLOWED_INSTALLMENTS=[1,2,3,4,6,9,12]as const;
export function parseIyzicoInstallments(value:string|undefined){if(!value?.trim())return[1];const allowed=new Set<number>(IYZICO_ALLOWED_INSTALLMENTS),parsed=[...new Set(value.split(",").map(item=>Number(item.trim())).filter(item=>Number.isInteger(item)&&allowed.has(item)))].sort((a,b)=>a-b);return parsed.length?parsed:[1];}

export function resolveIyzicoEnvironment(source:Record<string,string|undefined>):IyzicoEnvironmentSettings|null{
 const environment=source.IYZICO_ENVIRONMENT;
 if(environment!=="sandbox"&&environment!=="live")return null;
 const apiKey=environment==="live"?source.IYZICO_LIVE_API_KEY:(source.IYZICO_SANDBOX_API_KEY||source.IYZICO_API_KEY);
 const secretKey=environment==="live"?source.IYZICO_LIVE_SECRET_KEY:(source.IYZICO_SANDBOX_SECRET_KEY||source.IYZICO_SECRET_KEY);
 const baseUrl=(source.IYZICO_BASE_URL||IYZICO_ENVIRONMENT_URLS[environment]).replace(/\/$/,"");
 if(!apiKey||!secretKey)return null;
 try{
  const parsed=new URL(baseUrl),expected=new URL(IYZICO_ENVIRONMENT_URLS[environment]);
  if(parsed.protocol!=="https:"||parsed.hostname!==expected.hostname||parsed.pathname!=="/"||parsed.search||parsed.hash)return null;
 }catch{return null;}
 return{environment,apiKey,secretKey,baseUrl,livePaymentsEnabled:enabled(source.IYZICO_LIVE_PAYMENTS_ENABLED),enabledInstallments:parseIyzicoInstallments(source.IYZICO_ENABLED_INSTALLMENTS)};
}
