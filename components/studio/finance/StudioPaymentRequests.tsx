"use client";

import {useState} from "react";
import {cancelStudioPaymentRequestAction,createStudioPaymentRequestAction} from "@/app/studio/(protected)/projects/[projectId]/finance/actions";
import {studioButtonClass} from "@/components/studio/StudioButton";
import {StudioBadge,StudioCard,StudioEmptyState,StudioModal,StudioSectionHeader} from "@/components/studio/ui";
import type {StudioPaymentRequest} from "@/lib/payments/payment-request-types";

const typeLabels={deposit:"Ön Ödeme",progress_payment:"Hakediş",final_payment:"Final Ödemesi",other:"Diğer"} as const;
const statusLabels={pending:"Bekliyor",paid:"Ödendi",cancelled:"İptal"} as const;
const statusVariant=(status:string)=>status==="paid"?"success" as const:status==="cancelled"?"danger" as const:"warning" as const;
const money=(amount:string,currency:string)=>new Intl.NumberFormat("tr-TR",{style:"currency",currency}).format(Number(amount));
const date=(value:string|null)=>value?new Intl.DateTimeFormat("tr-TR",{day:"numeric",month:"long",year:"numeric",timeZone:"Europe/Istanbul"}).format(new Date(`${value}T12:00:00Z`)):"Belirtilmedi";
const paymentFormId="studio-payment-request-form";

export default function StudioPaymentRequests({projectId,canManage,requests}:{projectId:string;canManage:boolean;requests:StudioPaymentRequest[]}){
  const [open,setOpen]=useState(false);
  const [message,setMessage]=useState("");

  return <StudioCard className="mt-4 overflow-hidden p-0">
    <div className="p-4"><StudioSectionHeader title="Müşteri Ödeme Talepleri" description="Client Portal’da gösterilecek, proje kapsamlı ödeme talepleri" icon="payments" count={requests.length} action={canManage?<button type="button" onClick={()=>setOpen(true)} className={studioButtonClass("primary","sm")}>Ödeme Talebi Oluştur</button>:undefined}/></div>
    <div className="border-t border-[#edf0f2]">{requests.length?requests.map(request=><article key={request.id} className="grid min-w-0 items-center gap-3 border-b border-[#edf0f2] px-4 py-3 last:border-0 md:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
      <div className="min-w-0"><h3 className="truncate text-[13px] font-semibold">{request.title}</h3><p className="mt-1 line-clamp-2 text-[11px] text-[#89939a]">{typeLabels[request.paymentType]} · Son ödeme: {date(request.dueDate)}</p>{request.description?<p className="mt-1 line-clamp-2 text-[11px] text-[#89939a]">{request.description}</p>:null}</div>
      <strong className="text-sm">{money(request.amount,request.currency)}</strong>
      <div className="flex flex-wrap items-center gap-2"><StudioBadge variant={statusVariant(request.status)}>{statusLabels[request.status]}</StudioBadge>{request.paymentProvider==="iyzico"?<span className="text-[11px] text-[#64748b]">iyzico ile tahsil edildi</span>:null}</div>
      {canManage&&request.status==="pending"?<form action={async()=>{const result=await cancelStudioPaymentRequestAction(projectId,request.id);setMessage(result.message)}}><button className={studioButtonClass("danger","sm")}>İptal Et</button></form>:<span/>}
    </article>):<StudioEmptyState icon="payments" title="Ödeme talebi yok" description="Müşteri için henüz bir ödeme talebi oluşturulmadı."/>}</div>
    {message?<p role="status" className="border-t border-[#edf0f2] px-4 py-3 text-sm">{message}</p>:null}
    <StudioModal open={open} title="Ödeme Talebi Oluştur" onClose={()=>setOpen(false)} footer={<><button type="button" onClick={()=>setOpen(false)} className={studioButtonClass("secondary","md")}>Vazgeç</button><button type="submit" form={paymentFormId} className={studioButtonClass("primary","md")}>Kaydet</button></>}>
      <form id={paymentFormId} action={async form=>{const result=await createStudioPaymentRequestAction(projectId,form);setMessage(result.message);if(result.success)setOpen(false)}} className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold sm:col-span-2">Ödeme Başlığı<input name="title" required minLength={2} maxLength={180} className="studio-field mt-1 w-full" placeholder="2. Hakediş"/></label>
        <label className="text-sm font-semibold">Ödeme Türü<select name="paymentType" defaultValue="progress_payment" className="studio-field mt-1 w-full"><option value="deposit">Ön Ödeme</option><option value="progress_payment">Hakediş</option><option value="final_payment">Final Ödemesi</option><option value="other">Diğer</option></select></label>
        <label className="text-sm font-semibold">Tutar<input name="amount" required inputMode="decimal" pattern="[0-9]+([,.][0-9]{1,2})?" className="studio-field mt-1 w-full" placeholder="75000,00"/></label>
        <label className="text-sm font-semibold">Para Birimi<select name="currency" defaultValue="TRY" className="studio-field mt-1 w-full"><option value="TRY">TRY</option></select></label>
        <label className="text-sm font-semibold">Son Ödeme Tarihi<input name="dueDate" type="date" className="studio-field mt-1 w-full"/></label>
        <label className="text-sm font-semibold sm:col-span-2">Açıklama<textarea name="description" maxLength={4000} className="studio-field mt-1 min-h-24 w-full" placeholder="Mimari proje 2. hakediş ödemesi"/></label>
      </form>
    </StudioModal>
  </StudioCard>;
}
