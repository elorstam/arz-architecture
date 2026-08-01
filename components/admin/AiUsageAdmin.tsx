"use client";

import {useCallback, useEffect, useState} from "react";

type Data = {
  todayCost: number;
  monthCost: number;
  inputTokens: number;
  outputTokens: number;
  requests: number;
  estimatedRemaining: number;
  budget: {
    initialCreditUsd: number;
    warningThresholdUsd: number;
    criticalThresholdUsd: number;
  };
  byModel: Array<{
    model: string;
    inputTokens: number;
    outputTokens: number;
    requests: number;
  }>;
  cachedAt: string;
  usageError?: string;
  configurationWarning?: string;
  budgetWarning?: string;
  studio?:{requests:number;todayRequests:number;successful:number;failed:number;fallback:number;usageUnavailable:number;pricingUnknown:number;totalTokens:number;estimatedCostUsd:number|null;byModule:Array<{module:string;requests:number;totalTokens:number}>;byOperation:Array<{operation:string;requests:number;totalTokens:number}>;byModel:Array<{model:string;requests:number;inputTokens:number;outputTokens:number;totalTokens:number;estimatedCostUsd:number|null}>};
};

const billingUrl = "https://platform.openai.com/settings/organization/billing/overview";

export default function AiUsageAdmin() {
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [query,setQuery]=useState("");
  const [filters,setFilters]=useState({from:"",to:"",module:"",operation:"",model:"",organization:"",user:"",status:"",fallback:"",usageUnavailable:"",pricingUnknown:""});

  const load=useCallback(async function load() {
    setLoadError("");
    try {
      const response = await fetch(`/api/admin/ai-usage${query?`?${query}`:""}`);
      const payload = (await response.json()) as Data & {error?: string};
      if (!response.ok) throw new Error(payload.error || "AI kullanım paneli yüklenemedi.");
      setData(payload);
    } catch {
      setLoadError("AI kullanım paneli şu anda yüklenemiyor.");
    }
  },[query]);

  useEffect(() => {
    const task = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(task);
  }, [load]);

  async function save() {
    if (!data) return;
    setSaveStatus("Kaydediliyor…");
    const response = await fetch("/api/admin/ai-usage", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify(data.budget),
    });
    const payload = (await response.json()) as {error?: string};
    if (!response.ok) {
      setSaveStatus(payload.error || "Bütçe ayarları kaydedilemedi.");
      return;
    }
    setSaveStatus("Bütçe ayarları kaydedildi.");
    await load();
  }

  if (loadError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl">AI Kullanımı</h1>
        <p className="mt-4 rounded border border-amber-400/30 p-4 text-amber-100">
          {loadError}
        </p>
        <a className="mt-4 inline-block underline" href={billingUrl} target="_blank" rel="noreferrer">
          OpenAI Billing ekranı
        </a>
      </div>
    );
  }

  if (!data) return <p className="p-6">Kullanım verileri yükleniyor…</p>;

  const critical = data.estimatedRemaining < data.budget.criticalThresholdUsd;
  const warning = data.estimatedRemaining < data.budget.warningThresholdUsd;

  return (
    <div className="p-6">
      <h1 className="text-2xl">AI Kullanımı</h1>

      {data.configurationWarning && (
        <div className="mt-4 border border-sky-400/30 bg-sky-400/10 p-4 text-sky-100">
          {data.configurationWarning}
        </div>
      )}
      {data.usageError && (
        <div className="mt-4 border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">
          {data.usageError}
        </div>
      )}
      {data.budgetWarning && (
        <div className="mt-4 border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">
          {data.budgetWarning}
        </div>
      )}
      {(critical || warning) && (
        <div className={`my-4 border p-4 ${critical ? "border-red-500 bg-red-500/10 text-red-200" : "border-amber-400 bg-amber-400/10 text-amber-100"}`}>
          {critical ? "Kritik: tahmini bakiye çok düşük." : "Uyarı: tahmini bakiye düşük."}
        </div>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-5">
        {[
          ["Bugün", data.todayCost, "$"],
          ["Bu ay", data.monthCost, "$"],
          ["İstek", data.requests, ""],
          ["Girdi token", data.inputTokens, ""],
          ["Çıktı token", data.outputTokens, ""],
        ].map(([label, value, prefix]) => (
          <div key={String(label)} className="border border-white/10 p-4">
            <p className="text-xs text-white/50">{label}</p>
            <p className="mt-2 text-2xl">{prefix}{Number(value).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border border-white/10 p-5">
        <p className="text-sm text-white/50">Tahmini kalan bakiye</p>
        <p className="text-3xl">${data.estimatedRemaining.toFixed(2)}</p>
        <p className="mt-2 text-xs text-white/40">
          Bu değer tahminidir. Kullanım verileri en fazla beş dakika önbelleklenir.
        </p>
        <a className="mt-3 inline-block text-sm underline" href={billingUrl} target="_blank" rel="noreferrer">
          OpenAI Billing ekranını aç
        </a>
      </div>

      {data.studio?<section className="mt-6 border border-white/10 p-5"><div><h2 className="text-xl">Studio AI kullanımı</h2><p className="mt-1 text-sm text-white/50">Organizasyon ve kullanıcı ilişkilendirmeli gerçek Responses API çağrıları</p></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{([['from','Başlangıç','date'],['to','Bitiş','date'],['model','Model','text'],['organization','Organizasyon','text'],['user','Kullanıcı','text']] as const).map(([key,label,type])=><label key={key} className="text-sm">{label}<input type={type} value={filters[key]} onChange={event=>setFilters({...filters,[key]:event.target.value})} className="mt-1 w-full bg-black p-2"/></label>)}<FilterSelect label="Modül" value={filters.module} onChange={value=>setFilters({...filters,module:value})} options={[['official_processes','Harç Mesajları'],['project_stages','Proje Aşaması'],['crm','CRM'],['proposals','Teklif'],['decision_log','Karar Özeti']]}/><FilterSelect label="Operasyon" value={filters.operation} onChange={value=>setFilters({...filters,operation:value})} options={Object.values(STUDIO_OPERATIONS).map(value=>[value,value])}/><FilterSelect label="Durum" value={filters.status} onChange={value=>setFilters({...filters,status:value})} options={[["success","Başarılı"],["fallback","Fallback"],["failed","Hatalı"]]}/>{([['fallback','Fallback'],['usageUnavailable','Usage unavailable'],['pricingUnknown','Pricing unknown']] as const).map(([key,label])=><FilterSelect key={key} label={label} value={filters[key]} onChange={value=>setFilters({...filters,[key]:value})} options={[["true","Evet"],["false","Hayır"]]}/>)}</div><button type="button" onClick={()=>setQuery(new URLSearchParams(Object.entries(filters).filter(([,value])=>value)).toString())} className="mt-3 border border-white/30 px-4 py-2">Filtrele</button><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Bugünkü istek",data.studio.todayRequests],["Toplam istek",data.studio.requests],["Başarılı",data.studio.successful],["Hatalı",data.studio.failed],["Fallback",data.studio.fallback],["Usage alınamadı",data.studio.usageUnavailable],["Fiyat bilinmiyor",data.studio.pricingUnknown],["Toplam token",data.studio.totalTokens]].map(([label,value])=><div key={String(label)} className="border border-white/10 p-3"><p className="text-xs text-white/50">{label}</p><p className="mt-1 text-xl">{Number(value).toLocaleString("tr-TR")}</p></div>)}</div><div className="mt-5 grid gap-5 lg:grid-cols-3"><UsageTable title="Modüller" rows={data.studio.byModule.map(row=>[row.module,row.requests,row.totalTokens])}/><UsageTable title="Operasyonlar" rows={data.studio.byOperation.map(row=>[row.operation,row.requests,row.totalTokens])}/><UsageTable title="Modeller" rows={data.studio.byModel.map(row=>[row.model,row.requests,row.totalTokens])}/></div></section>:null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["Başlangıç bütçesi", "initialCreditUsd"],
          ["Uyarı eşiği", "warningThresholdUsd"],
          ["Kritik eşik", "criticalThresholdUsd"],
        ].map(([label, key]) => (
          <label key={key}>
            {label}
            <input
              type="number"
              min="0"
              step="0.01"
              className="field"
              value={data.budget[key as keyof Data["budget"]]}
              onChange={(event) =>
                setData({
                  ...data,
                  budget: {...data.budget, [key]: Number(event.target.value)},
                })
              }
            />
          </label>
        ))}
      </div>
      <button onClick={save} className="mt-4 bg-white px-5 py-2 text-black">
        Bütçe ayarlarını kaydet
      </button>
      {saveStatus && <p className="mt-3 text-sm text-white/60">{saveStatus}</p>}
    </div>
  );
}

function UsageTable({title,rows}:{title:string;rows:Array<[string,number,number]>}){return <div><h3 className="font-semibold">{title}</h3><div className="mt-2 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-white/50"><th className="p-2">Ad</th><th className="p-2">İstek</th><th className="p-2">Token</th></tr></thead><tbody>{rows.map(row=><tr key={row[0]} className="border-t border-white/10"><td className="break-words p-2">{row[0]}</td><td className="p-2">{row[1]}</td><td className="p-2">{row[2]}</td></tr>)}</tbody></table></div></div>}
const STUDIO_OPERATIONS={fee:"fee_ai_whatsapp_message",stage:"stage_ai_description",crm:"crm_ai_meeting_note",proposal:"proposal_ai_description",decision:"decision_ai_summary"};
function FilterSelect({label,value,onChange,options}:{label:string;value:string;onChange:(value:string)=>void;options:string[][]}){return <label className="text-sm">{label}<select value={value} onChange={event=>onChange(event.target.value)} className="mt-1 w-full bg-black p-2"><option value="">Tümü</option>{options.map(([key,text])=><option key={key} value={key}>{text}</option>)}</select></label>}
