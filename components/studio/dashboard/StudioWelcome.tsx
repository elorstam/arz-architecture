import {StudioIconSurface} from "@/components/studio/ui";

function firstName(name:string){return name.trim().split(/\s+/)[0]||"Kullanıcı";}

export default function StudioWelcome({userName,organizationName,dateLabel}:{userName:string;organizationName:string;dateLabel:string}){
  return <header className="studio-dashboard-greeting" aria-labelledby="studio-dashboard-greeting-title">
    <div className="min-w-0"><p className="studio-eyebrow">{organizationName} · Ofis Operasyon Merkezi</p><h1 id="studio-dashboard-greeting-title" className="studio-dashboard-greeting__title">Hoş geldin, {firstName(userName)}!</h1><p className="studio-dashboard-greeting__description">Bugünkü işleri, aktif projeleri ve ofis akışını tek bakışta takip edin.</p></div>
    <div className="studio-dashboard-greeting__meta rounded-[20px] border border-[#e2e7eb] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(40,57,73,.05)]"><StudioIconSurface icon="calendar" tone="blue" size="lg"/><div><p className="text-xs font-semibold text-[#78838a]">Bugün</p><p className="mt-0.5 text-sm font-semibold capitalize text-[#34414a]">{dateLabel}</p></div></div>
  </header>;
}
