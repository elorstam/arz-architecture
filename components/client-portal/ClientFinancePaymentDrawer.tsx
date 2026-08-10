"use client";

import {useEffect} from "react";
import {studioButtonClass} from "@/components/studio/StudioButton";
import {StudioBadge} from "@/components/studio/ui/StudioUiPrimitives";
import type {ClientFinance} from "@/lib/client-portal/get-client-dashboard";

type BadgeVariant="success"|"danger"|"info"|"warning";

export default function ClientFinancePaymentDrawer({payment,projectName,statusLabel,statusVariant,typeLabel,amount,dueDate,createdAt,isOverdue,downloadable,onClose}:{payment:ClientFinance;projectName:string;statusLabel:string;statusVariant:BadgeVariant;typeLabel:string;amount:string;dueDate:string;createdAt:string;isOverdue:boolean;downloadable:boolean;onClose:()=>void}){
 useEffect(()=>{const handleEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose()};document.addEventListener("keydown",handleEscape);return()=>document.removeEventListener("keydown",handleEscape)},[onClose]);
 return <>
  <div className="client-finance-drawer-overlay" onClick={onClose} aria-hidden="true"/>
  <aside className="client-finance-payment-drawer" role="dialog" aria-modal="true" aria-labelledby="client-finance-drawer-title" onClick={event=>event.stopPropagation()}>
   <header><div><p>Ödeme Detayı</p><h2 id="client-finance-drawer-title">{payment.title}</h2></div><button type="button" onClick={onClose} aria-label="Ödeme detayını kapat">×</button></header>
   <div className="client-finance-payment-drawer__body client-finance-detail">
    <div><StudioBadge variant={statusVariant}>{statusLabel}</StudioBadge>{isOverdue?<StudioBadge variant="danger">Gecikti</StudioBadge>:null}</div>
    {payment.description?<section><h3>Açıklama</h3><p>{payment.description}</p></section>:null}
    <dl><div><dt>Proje</dt><dd>{projectName}</dd></div><div><dt>Tür</dt><dd>{typeLabel}</dd></div><div><dt>Tutar</dt><dd>{amount}</dd></div><div><dt>Vade</dt><dd>{dueDate}</dd></div><div><dt>Kayıt tarihi</dt><dd>{createdAt}</dd></div></dl>
    {payment.document_file_id&&downloadable?<a href={`/client/files/${payment.document_file_id}/download`} className={studioButtonClass("primary","sm")} aria-label={`${payment.title} belgesini güvenli şekilde indir`}>Belgeyi İndir</a>:null}
   </div>
  </aside>
 </>;
}
