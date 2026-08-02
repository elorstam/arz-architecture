import Link from "next/link";

import {StudioIcon,type StudioIconName} from "@/components/studio/StudioIcons";
import {StudioCard,StudioIconSurface,StudioSectionHeader,type StudioIconTone} from "@/components/studio/ui";
import type {OfficialProcess} from "@/lib/studio/official-processes/official-process-types";

function money(value:number){return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(value);}

export default function StudioPermitSummary({items}:{items:OfficialProcess[]}) {
  const active=items.filter(item=>!item.isArchived&&item.status!=="cancelled");
  const fees=active.filter(item=>item.entityType==="fee");
  const total=fees.reduce((sum,item)=>sum+(item.amount??0),0);
  const paid=fees.filter(item=>item.status==="paid"||item.status==="document_received").reduce((sum,item)=>sum+(item.amount??0),0);
  const documentProcesses=active.filter(item=>item.entityType!=="fee");
  const receivedDocuments=documentProcesses.filter(item=>Boolean(item.receivedDocumentFileId)).length;
  const completedApplications=documentProcesses.filter(item=>item.status==="document_received"||item.status==="paid").length;
  const metrics:Array<{label:string;value:string;detail:string;icon:StudioIconName;tone:StudioIconTone}>=[
    {label:"Toplam Harç",value:money(total),detail:"Tüm aktif projeler",icon:"receipt",tone:"gold"},
    {label:"Ödenen",value:money(paid),detail:"Tamamlanan ödemeler",icon:"check",tone:"green"},
    {label:"Bekleyen",value:money(total-paid),detail:"Ödeme bekleyen",icon:"clock",tone:"amber"},
    {label:"Toplam Evrak",value:String(documentProcesses.length),detail:"Başvuru kayıtları",icon:"files",tone:"blue"},
    {label:"Eksik Evrak",value:String(Math.max(0,documentProcesses.length-receivedDocuments)),detail:"Belgesi alınmayan",icon:"warning",tone:"red"},
    {label:"Tamamlanan",value:String(completedApplications),detail:"Başvurular",icon:"file-text",tone:"purple"},
  ];
  return <section aria-label="Tüm aktif projelerin resmî süreç özeti" className="h-full min-h-0"><StudioCard className="flex h-full min-h-0 flex-col overflow-hidden p-0"><div className="p-6"><StudioSectionHeader title="Tüm Aktif Projelerin Resmî Süreç Özeti" description="Harç ve evrakların ofis toplamı" icon="receipt" action={<Link href="/studio/projects" className="text-xs font-semibold text-[#55798c]">Detay →</Link>}/></div><div className="grid flex-1 grid-cols-2 gap-px border-t border-[#edf0f2] bg-[#edf0f2]">{metrics.map(metric=><article key={metric.label} className="min-w-0 bg-white p-4"><StudioIconSurface icon={metric.icon} tone={metric.tone} size="lg"/><p className="mt-3 text-[11px] font-semibold uppercase tracking-[.06em] text-[#929ba0]">{metric.label}</p><p className="mt-1 truncate text-lg font-bold tracking-[-.035em] text-[#2f3b43]" title={metric.value}>{metric.value}</p><p className="mt-1 text-xs text-[#9aa2a7]">{metric.detail}</p></article>)}</div></StudioCard></section>;
}
