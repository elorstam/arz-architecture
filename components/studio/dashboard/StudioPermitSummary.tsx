import Link from "next/link";
import {StudioIcon} from "@/components/studio/StudioIcons";
import {StudioKpiCard,StudioSectionHeader} from "@/components/studio/ui";
import type {OfficialProcess} from "@/lib/studio/official-processes/official-process-types";

function money(value:number){return new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",maximumFractionDigits:0}).format(value);}

export default function StudioPermitSummary({items}:{items:OfficialProcess[]}) {
  const fees=items.filter(item=>item.entityType==="fee"&&!item.isArchived);
  const total=fees.reduce((sum,item)=>sum+(item.amount??0),0);
  const paid=fees.filter(item=>item.status==="paid"||item.status==="document_received").reduce((sum,item)=>sum+(item.amount??0),0);
  const pending=total-paid;
  const docs=items.filter(item=>Boolean(item.receivedDocumentFileId)).length;
  return <section aria-label="Harç ve Evraklar özeti" className="studio-dashboard-permit studio-card-v2">
    <StudioSectionHeader title="Harç ve Evraklar" description="Aktif projelerin resmi süreç özeti" icon="receipt" action={<Link href="/studio/projects" className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#d9d3c6] bg-white px-3.5 text-sm font-semibold text-[#34414a] transition hover:border-[#ab925f] hover:bg-[#fbfaf6]">Detaya Git <StudioIcon name="chevron-right" className="h-4 w-4" /></Link>} />
    <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StudioKpiCard label="Toplam Harç" value={money(total)} detail="Aktif resmi süreçler" icon="receipt" />
      <StudioKpiCard label="Ödenen" value={money(paid)} detail="Tamamlanan tahakkuklar" icon="check" />
      <StudioKpiCard label="Bekleyen" value={money(pending)} detail="Ödeme bekleyen harçlar" icon="clock" />
      <StudioKpiCard label="Belgeler" value={String(docs)} detail={`${items.length} süreç içinde`} icon="files" />
    </div>
  </section>;
}
