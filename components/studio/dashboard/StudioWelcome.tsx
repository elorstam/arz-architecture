import {StudioIconSurface} from "@/components/studio/ui";

function firstName(name:string){return name.trim().split(/\s+/)[0]||"Kullanıcı";}

export default function StudioWelcome({userName,organizationName,dateLabel}:{userName:string;organizationName:string;dateLabel:string}){
  return <header className="studio-dashboard-greeting" aria-labelledby="studio-dashboard-greeting-title">
    <div className="min-w-0"><h1 id="studio-dashboard-greeting-title" className="studio-dashboard-greeting__title">Hoş geldin, {firstName(userName)}!</h1><p className="studio-dashboard-greeting__description">{organizationName} için bugünkü işleri, aktif projeleri ve ofis akışını tek bakışta takip edin.</p></div>
    <div className="studio-dashboard-greeting__meta rounded-2xl border border-[#e2e7eb] bg-white px-3 py-2 shadow-[0_6px_18px_rgba(40,57,73,.045)]"><StudioIconSurface icon="calendar" tone="blue" size="md"/><div><p className="text-[11px] font-semibold text-[#78838a]">Bugün</p><p className="text-[13px] font-semibold capitalize text-[#34414a]">{dateLabel}</p></div></div>
  </header>;
}
