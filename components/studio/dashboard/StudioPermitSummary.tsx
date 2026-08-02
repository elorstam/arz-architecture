import Link from "next/link";
import {StudioIcon} from "@/components/studio/StudioIcons";
import {StudioBadge,StudioKpiCard,StudioSectionHeader} from "@/components/studio/ui";
import type {OfficialProcess} from "@/lib/studio/official-processes/official-process-types";

function money(value:number){return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(value);}

export default function StudioPermitSummary({items}:{items:OfficialProcess[]}) {
  const fees=items.filter(item=>item.entityType==="fee"&&!item.isArchived);
  const total=fees.reduce((sum,item)=>sum+(item.amount??0),0);
  const paid=fees.filter(item=>item.status==="paid"||item.status==="document_received").reduce((sum,item)=>sum+(item.amount??0),0);
  const docs=items.filter(item=>Boolean(item.receivedDocumentFileId)).length;
  const recent=items.slice(0,3);
  return <section aria-label="Harç ve Evraklar özeti" className="studio-dashboard-permit studio-card-v2">
    <StudioSectionHeader title="Harç ve Evraklar" description="Resmi süreçlerin güncel özeti" icon="receipt" action={<Link href="/studio/finance" className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#d9d3c6] bg-white px-3.5 text-sm font-semibold text-[#34414a] transition hover:border-[#ab925f] hover:bg-[#fbfaf6]">Detayları Gör <StudioIcon name="chevron-right" className="h-4 w-4" /></Link>} />
    <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StudioKpiCard label="Toplam Harç Tutarı" value={money(total)} detail="Aktif resmi süreçler" icon="receipt" />
      <StudioKpiCard label="Ödenen Toplam" value={money(paid)} detail="Tamamlanan tahakkuklar" icon="payments" />
      <StudioKpiCard label="Ödenen Harç" value={money(paid)} detail="Ödeme durumu" icon="check" />
      <StudioKpiCard label="Alınan Evrak" value={String(docs)} detail={`${items.length} süreç içinde`} icon="files" />
    </div>
    <div className="mt-6 border-t border-[#ece8df] pt-5"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-[#34414a]">Son İşlemler</h3><StudioBadge variant={items.length?"info":"neutral"} icon="activity">{items.length?`${items.length} süreç`:"Kayıt yok"}</StudioBadge></div>
      {recent.length?<ul className="mt-3 divide-y divide-[#efebe3]">{recent.map(item=><li key={item.id} className="flex min-w-0 items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#f4eee2] text-[#8d7548]"><StudioIcon name="file-text" className="h-4 w-4"/></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#39454d]">{item.title}</p><p className="text-xs text-[#858c88]">{item.status}</p></div></div><span className="shrink-0 text-xs text-[#7b817e]">{item.amount===null?"—":money(item.amount)}</span></li>)}</ul>:<div className="studio-dashboard-empty mt-3"><StudioIcon name="folder" className="h-6 w-6"/><p className="mt-2 text-sm font-semibold text-[#39454d]">Henüz evrak eklenmemiş</p><p className="mt-1 text-xs text-[#858c88]">Bu proje için resmi süreç kaydı bulunmuyor.</p></div>}
    </div>
  </section>;
}
