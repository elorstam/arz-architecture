import type {StudioProject} from "@/components/studio/projects/StudioProjectData";
import {StudioCard,StudioSectionHeader} from "@/components/studio/ui";

export default function StudioProjectClientCard({client,location}:{client:StudioProject["client"];location:string}){
 const rows=[{label:"Ad",value:client.name},{label:"Telefon",value:client.phone},{label:"Mail",value:client.email},{label:"Adres",value:location},{label:"Not",value:client.contact}];
 return <StudioCard as="section" className="h-full p-4"><StudioSectionHeader title="Müşteri Bilgileri" description="Projenin iletişim bağlamı" icon="clients"/><dl className="mt-3 divide-y divide-[#e7ecf3]">{rows.map(row=><div key={row.label} className="grid min-h-10 grid-cols-[72px_minmax(0,1fr)] items-center gap-3 py-2"><dt className="text-[11px] font-medium text-[#82909a]">{row.label}</dt><dd className="min-w-0 break-words text-[12px] font-medium text-[#334155]">{row.value||"—"}</dd></div>)}</dl></StudioCard>;
}
