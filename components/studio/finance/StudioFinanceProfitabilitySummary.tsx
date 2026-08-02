import type {FinanceDashboard} from "@/lib/studio/finance/finance-types";
import {money} from "@/lib/studio/finance/finance-validation";

function Metric({label,value}:{label:string;value:string}){return <div className="rounded-xl border bg-white p-5"><p className="text-sm text-[#68706f]">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div>}

export default function StudioFinanceProfitabilitySummary({data}:{data:FinanceDashboard}){
 const p=data.profitability;
 const sum=(key:"expected"|"collected"|"remaining"|"expense"|"paidExpense"|"pendingExpense"|"profit")=>p.reduce((total,row)=>total+row[key],0);
 return <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Anlaşılan Bedel" value={money(sum("expected"))}/><Metric label="Tahsil Edilen" value={money(sum("collected"))}/><Metric label="Kalan Tahsilat" value={money(sum("remaining"))}/><Metric label="Toplam Gider" value={money(sum("expense"))}/><Metric label="Ödenmiş Gider" value={money(sum("paidExpense"))}/><Metric label="Bekleyen Gider" value={money(sum("pendingExpense"))}/><Metric label="Brüt Kâr" value={money(sum("profit"))}/><Metric label="Kâr Marjı" value={data.summary.averageMargin===null?"Henüz hesaplanamıyor":`%${data.summary.averageMargin.toFixed(1)}`}/></div>;
}
