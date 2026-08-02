import {StudioIcon} from "@/components/studio/StudioIcons";

function firstName(name:string){return name.trim().split(/\s+/)[0]||"Kullanıcı";}

export default function StudioWelcome({userName,organizationName,dateLabel,projectName}:{userName:string;organizationName:string;dateLabel:string;projectName:string}){
  return <header className="studio-dashboard-greeting" aria-labelledby="studio-dashboard-greeting-title">
    <div className="min-w-0"><p className="studio-eyebrow">{organizationName}</p><h1 id="studio-dashboard-greeting-title" className="studio-dashboard-greeting__title">Hoş geldin, {firstName(userName)}!</h1><p className="studio-dashboard-greeting__description">{projectName?`${projectName} projesine genel bakış.`:"Çalışma alanınızdaki projeleri, resmi süreçleri ve güncel iş akışını tek bakışta takip edin."}</p></div>
    <div className="studio-dashboard-greeting__meta"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f1ece2] text-[#927845]"><StudioIcon name="calendar" className="h-5 w-5"/></span><div><p className="text-xs font-semibold text-[#6f7773]">Bugün</p><p className="mt-0.5 text-sm font-medium capitalize text-[#39454d]">{dateLabel}</p></div></div>
  </header>;
}
