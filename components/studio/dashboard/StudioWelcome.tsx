import {StudioPageHeader} from "@/components/studio/ui";

function firstName(name:string){return name.trim().split(/\s+/)[0]||"Kullanıcı";}
export default function StudioWelcome({userName,organizationName,dateLabel}:{userName:string;organizationName:string;dateLabel:string}){
  return <StudioPageHeader eyebrow={organizationName} title={`Hoş geldiniz, ${firstName(userName)}.`} description="Bugün iki onay, bir geciken revizyon ve hazırlanması gereken bir teklif var." actions={<div className="text-right"><p className="studio-eyebrow">Bugün</p><p className="mt-1 text-sm font-medium capitalize text-[#555c61]">{dateLabel}</p></div>} />;
}
