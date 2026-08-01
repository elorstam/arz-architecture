import "server-only";
import {createHmac,timingSafeEqual}from"node:crypto";

export function isWhatsAppConfigured(){return Boolean(process.env.WHATSAPP_ACCESS_TOKEN&&process.env.WHATSAPP_PHONE_NUMBER_ID&&process.env.WHATSAPP_APP_SECRET);}
export function verifyWhatsAppSignature(body:string,signature:string|null){const secret=process.env.WHATSAPP_APP_SECRET;if(!secret||!signature?.startsWith("sha256="))return false;const expected=`sha256=${createHmac("sha256",secret).update(body).digest("hex")}`;const a=Buffer.from(expected);const b=Buffer.from(signature);return a.length===b.length&&timingSafeEqual(a,b);}
export async function sendWhatsAppTemplate(input:{phone:string;templateName:string;language?:string;parameters:string[]}){
 const token=process.env.WHATSAPP_ACCESS_TOKEN;const phoneId=process.env.WHATSAPP_PHONE_NUMBER_ID;if(!token||!phoneId)return{ok:false as const,errorCode:"whatsapp_not_configured"};
 try{const response=await fetch(`https://graph.facebook.com/v23.0/${encodeURIComponent(phoneId)}/messages`,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:JSON.stringify({messaging_product:"whatsapp",to:input.phone,type:"template",template:{name:input.templateName,language:{code:input.language??"tr"},components:[{type:"body",parameters:input.parameters.map(text=>({type:"text",text}))}]}}),cache:"no-store"});if(!response.ok)return{ok:false as const,errorCode:`whatsapp_http_${response.status}`};const body=await response.json()as{messages?:{id?:string}[]};const messageId=body.messages?.[0]?.id;return messageId?{ok:true as const,messageId}:{ok:false as const,errorCode:"whatsapp_response_invalid"};}catch{return{ok:false as const,errorCode:"whatsapp_unavailable"};}
}
