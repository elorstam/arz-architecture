"use client";

import {createPortal} from "react-dom";
import {useCallback, useEffect, useState} from "react";
import {studioButtonClass} from "@/components/studio/StudioButton";
import {StudioBadge} from "@/components/studio/ui/StudioUiPrimitives";
import type {ClientFinance} from "@/lib/client-portal/get-client-dashboard";

type BadgeVariant="success"|"danger"|"info"|"warning";

type Props={
 payment:ClientFinance;
 projectName:string;
 statusLabel:string;
 statusVariant:BadgeVariant;
 typeLabel:string;
 amount:string;
 dueDate:string;
 createdAt:string;
 isOverdue:boolean;
 downloadable:boolean;
 onClose:()=>void;
};

export default function ClientFinancePaymentDrawer({payment,projectName,statusLabel,statusVariant,typeLabel,amount,dueDate,createdAt,isOverdue,downloadable,onClose}:Props){
 const [mounted,setMounted]=useState(false);

 useEffect(()=>{setMounted(true)},[]);

 useEffect(()=>{
  if(!mounted)return;
  const handleEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose()};
  document.addEventListener("keydown",handleEscape);
  return()=>document.removeEventListener("keydown",handleEscape);
 },[mounted,onClose]);

 useEffect(()=>{
  if(!mounted)return;
  const html=document.documentElement;
  const body=document.body;
  const previousHtmlOverflow=html.style.overflow;
  const previousBodyOverflow=body.style.overflow;
  const previousBodyPaddingRight=body.style.paddingRight;
  const scrollbarWidth=window.innerWidth-html.clientWidth;
  html.style.overflow="hidden";
  body.style.overflow="hidden";
  if(scrollbarWidth>0)body.style.paddingRight=`${scrollbarWidth}px`;
  return()=>{
   html.style.overflow=previousHtmlOverflow;
   body.style.overflow=previousBodyOverflow;
   body.style.paddingRight=previousBodyPaddingRight;
  };
 },[mounted]);

 const close=useCallback(()=>onClose(),[onClose]);
 if(!mounted)return null;

 return createPortal(<div className="client-finance-payment-layer">
  <div className="client-finance-payment-overlay" onClick={close} aria-hidden="true"/>
  <aside className="client-finance-payment-panel" role="dialog" aria-modal="true" aria-labelledby="client-finance-payment-title" onClick={event=>event.stopPropagation()}>
   <header className="client-finance-payment-header">
    <div><p>ÖDEME DETAYI</p><h2 id="client-finance-payment-title">{payment.title}</h2></div>
    <button type="button" onClick={close} aria-label="Ödeme detayını kapat">×</button>
   </header>
   <div className="client-finance-payment-content">
    <div className="client-finance-detail-status"><StudioBadge variant={statusVariant}>{statusLabel}</StudioBadge>{isOverdue?<StudioBadge variant="danger">Gecikti</StudioBadge>:null}</div>
    {payment.description?<section><h3>Açıklama</h3><p>{payment.description}</p></section>:null}
    <dl><div><dt>Proje</dt><dd>{projectName}</dd></div><div><dt>Tür</dt><dd>{typeLabel}</dd></div><div><dt>Tutar</dt><dd>{amount}</dd></div><div><dt>Vade</dt><dd>{dueDate}</dd></div><div><dt>Kayıt tarihi</dt><dd>{createdAt}</dd></div></dl>
    {payment.document_file_id&&downloadable?<a href={`/client/files/${payment.document_file_id}/download`} className={studioButtonClass("primary","sm")} aria-label={`${payment.title} belgesini güvenli şekilde indir`}>Belgeyi İndir</a>:null}
   </div>
  </aside>
 </div>,document.body);
}
