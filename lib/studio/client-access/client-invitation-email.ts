import "server-only";

import {Resend} from "resend";

export type InvitationEmailDelivery="sent"|"unavailable"|"failed";
const FROM_EMAIL="ARZ Mimarlık <form@arzmimarlik.net>";
const escapeHtml=(value:string)=>value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");

export async function sendClientInvitationEmail(input:{email:string;projectName:string;invitationUrl:string;expiresAt:string}):Promise<InvitationEmailDelivery>{
  if(!process.env.RESEND_API_KEY)return "unavailable";
  try{
    const resend=new Resend(process.env.RESEND_API_KEY);
    const projectName=escapeHtml(input.projectName);
    const invitationUrl=escapeHtml(input.invitationUrl);
    const result=await resend.emails.send({
      from:FROM_EMAIL,to:[input.email],subject:`${input.projectName} | Müşteri Portalı Daveti`,
      html:`<p>Merhaba,</p><p><strong>${projectName}</strong> projesi için ARZ Studio Müşteri Portalı davetiniz hazır.</p><p><a href="${invitationUrl}">Daveti kabul et</a></p><p>Bu bağlantı ${new Date(input.expiresAt).toLocaleString("tr-TR")} tarihine kadar geçerlidir.</p>`,
      text:["ARZ Studio Müşteri Portalı Daveti",`${input.projectName} projesi için davetinizi kabul edin:`,input.invitationUrl,`Son kullanım: ${new Date(input.expiresAt).toLocaleString("tr-TR")}`].join("\n\n"),
    });
    return result.error?"failed":"sent";
  }catch{return "failed";}
}
