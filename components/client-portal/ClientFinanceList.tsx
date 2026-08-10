"use client";

import {useCallback,useMemo,useState} from "react";
import {StudioToolbar} from "@/components/studio/StudioDesignSystem";
import {studioButtonClass} from "@/components/studio/StudioButton";
import {StudioBadge,StudioSegmentedControl,StudioSelect} from "@/components/studio/ui/StudioUiPrimitives";
import {StudioIconSurface} from "@/components/studio/ui/StudioIconSurface";
import ClientFinancePaymentDrawer from "@/components/client-portal/ClientFinancePaymentDrawer";
import type {ClientFinance} from "@/lib/client-portal/get-client-dashboard";

const statusLabels:Record<string,string>={waiting:"Bekliyor",partial:"Kısmi",collected:"Tahsil Edildi",paid:"Ödendi",issued:"Düzenlendi",cancelled:"İptal"};
const typeLabels:Record<string,string>={income:"Ödeme",progress_payment:"Hakediş",invoice:"Fatura"};
const terminal=new Set(["collected","paid","cancelled"]);
const statusVariant=(status:string)=>["collected","paid"].includes(status)?"success" as const:status==="cancelled"?"danger" as const:status==="partial"?"info" as const:"warning" as const;
const date=(value:string|null)=>value?new Intl.DateTimeFormat("tr-TR",{day:"2-digit",month:"long",year:"numeric",timeZone:"Europe/Istanbul"}).format(new Date(value)):"Belirtilmedi";
const money=(item:ClientFinance)=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:item.currency}).format(Number(item.amount));
const overdue=(item:ClientFinance,today:string)=>Boolean(item.due_date&&item.due_date<today&&!terminal.has(item.status));

export default function ClientFinanceList({projectName,entries,downloadableFileIds,today}:{projectName:string;entries:ClientFinance[];downloadableFileIds:string[];today:string}){
 const[selectedPaymentId,setSelectedPaymentId]=useState<string|null>(null);
 const[segment,setSegment]=useState("all"),[status,setStatus]=useState("all"),[order,setOrder]=useState("newest");
 const downloadable=useMemo(()=>new Set(downloadableFileIds),[downloadableFileIds]);
 const selectedPayment=useMemo(()=>entries.find(payment=>payment.id===selectedPaymentId)??null,[entries,selectedPaymentId]);
 const closeDrawer=useCallback(()=>setSelectedPaymentId(null),[]);
 const upcoming=useMemo(()=>entries.filter(item=>item.due_date&&item.due_date>=today&&!terminal.has(item.status)).toSorted((a,b)=>String(a.due_date).localeCompare(String(b.due_date))).slice(0,3),[entries,today]);
 const visible=useMemo(()=>entries.filter(item=>{const group=segment==="all"||segment==="paid"&&["collected","paid"].includes(item.status)||segment==="pending"&&!terminal.has(item.status)||segment==="overdue"&&overdue(item,today);return group&&(status==="all"||item.status===status)}).toSorted((a,b)=>{const first=a.due_date||a.created_at,second=b.due_date||b.created_at;return order==="newest"?Date.parse(second)-Date.parse(first):Date.parse(first)-Date.parse(second)}),[entries,order,segment,status,today]);
 const statuses=useMemo(()=>Array.from(new Set(entries.map(item=>item.status))),[entries]);
 return <>
  {upcoming.length?<section className="client-upcoming-payments" aria-labelledby="client-upcoming-title"><h3 id="client-upcoming-title">Yaklaşan Ödemeler</h3><div>{upcoming.map(item=><article key={item.id}><StudioIconSurface icon="calendar" tone="orange" size="sm"/><span><strong>{item.title}</strong><small>{date(item.due_date)} · {statusLabels[item.status]??item.status}</small></span><b>{money(item)}</b></article>)}</div></section>:null}
  <StudioToolbar className="client-finance-toolbar"><StudioSegmentedControl ariaLabel="Ödeme kayıt görünümü" value={segment} onChange={setSegment} items={[{value:"all",label:"Tümü"},{value:"pending",label:"Bekleyen"},{value:"paid",label:"Ödenen"},{value:"overdue",label:"Geciken"}]}/><StudioSelect label="Durum" value={status} onChange={event=>setStatus(event.target.value)}><option value="all">Tümü</option>{statuses.map(item=><option key={item} value={item}>{statusLabels[item]??item}</option>)}</StudioSelect><StudioSelect label="Sıralama" value={order} onChange={event=>setOrder(event.target.value)}><option value="newest">En Yeni</option><option value="oldest">En Eski</option></StudioSelect><span className="client-finance-toolbar__count" aria-live="polite">{visible.length} kayıt</span></StudioToolbar>
  <ul className="client-finance-list">{visible.map(item=>{const isOverdue=overdue(item,today),canDownload=Boolean(item.document_file_id&&downloadable.has(item.document_file_id));return <li key={item.id} className={isOverdue?"is-overdue":""}><button type="button" className="client-finance-row-trigger" onClick={()=>setSelectedPaymentId(item.id)} aria-label={`${item.title} ödeme detayını aç`}><StudioIconSurface icon={item.entry_type==="invoice"?"receipt":"payments"} tone={isOverdue?"red":"blue"} size="md"/><span className="client-finance-row-copy"><strong>{item.title}</strong><span>{typeLabels[item.entry_type]??item.entry_type}{item.description?` · ${item.description}`:""}</span></span><b>{money(item)}</b><span className="client-finance-date">{item.due_date?`Vade ${date(item.due_date)}`:"Vade belirtilmedi"}</span><span className="client-finance-badges"><StudioBadge variant={statusVariant(item.status)}>{statusLabels[item.status]??item.status}</StudioBadge>{isOverdue?<StudioBadge variant="danger">Gecikti</StudioBadge>:null}</span></button>{canDownload?<a href={`/client/files/${item.document_file_id}/download`} className={studioButtonClass("outline","sm")} aria-label={`${item.title} belgesini indir`}>Belge</a>:null}</li>})}</ul>
  {selectedPayment?<ClientFinancePaymentDrawer payment={selectedPayment} projectName={projectName} statusLabel={statusLabels[selectedPayment.status]??selectedPayment.status} statusVariant={statusVariant(selectedPayment.status)} typeLabel={typeLabels[selectedPayment.entry_type]??selectedPayment.entry_type} amount={money(selectedPayment)} dueDate={date(selectedPayment.due_date)} createdAt={date(selectedPayment.created_at)} isOverdue={overdue(selectedPayment,today)} downloadable={Boolean(selectedPayment.document_file_id&&downloadable.has(selectedPayment.document_file_id))} onClose={closeDrawer}/>:null}
 </>;
}
