import "server-only";
export const NOTIFICATION_TEMPLATES={
 project_stage_completed:{version:1,body:"Merhaba {{customer_name}},\n\n{{project_name}} projenizin {{stage_name}} aşaması tamamlanmıştır.\n\nProje sürecindeki gelişmeleri sizinle paylaşmaya devam edeceğiz.\n\nARZ Mimarlık"},
 fee_assessment_ready:{version:1,body:"Merhaba {{customer_name}},\n\n{{project_name}} projenize ait {{fee_name}} tahakkuku hazırlanmıştır.\n\nTutar: {{amount}}\nSon ödeme tarihi: {{due_date}}\n\nÖdeme sonrasında dekontu paylaşabilirsiniz.\n\nARZ Mimarlık"},
 fee_payment_reminder:{version:1,body:"Merhaba {{customer_name}},\n\n{{fee_name}} için son ödeme tarihi {{due_date}}.\n\nARZ Mimarlık"},
 official_document_ready:{version:1,body:"Merhaba {{customer_name}},\n\n{{project_name}} projenize ait {{document_name}} hazırdır.\n\nARZ Mimarlık"},
 payment_receipt_received:{version:1,body:"Merhaba {{customer_name}},\n\n{{project_name}} projenize ait ödeme dekontu alınmıştır.\n\nARZ Mimarlık"}
}as const;
export type NotificationTemplateName=keyof typeof NOTIFICATION_TEMPLATES;
export function renderNotificationTemplate(name:NotificationTemplateName,variables:Record<string,string>){return NOTIFICATION_TEMPLATES[name].body.replace(/{{([a-z_]+)}}/g,(_,key:string)=>variables[key]??"");}
