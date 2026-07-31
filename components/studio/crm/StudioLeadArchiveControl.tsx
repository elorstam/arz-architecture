"use client";
import {useTransition} from "react";
import {setStudioLeadArchivedAction} from "@/app/studio/(protected)/crm/actions";
export default function StudioLeadArchiveControl({leadId,archived}:{leadId:string;archived:boolean}){
 const[pending,startTransition]=useTransition();function submit(){const message=archived?"Bu CRM kaydı arşivden çıkarılacak. Devam etmek istiyor musunuz?":"Bu CRM kaydı arşive taşınacak. Lead verileri silinmeyecek.";if(!window.confirm(message))return;startTransition(()=>setStudioLeadArchivedAction(leadId,!archived));}
 return <button type="button" onClick={submit} disabled={pending} className="h-10 rounded-lg border border-[#d8c9c1] px-4 text-[10px] font-medium text-[#875d4d] outline-none hover:bg-[#f8f1ee] disabled:cursor-wait disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#9e8452]/30">{pending?(archived?"Arşivden Çıkarılıyor...":"Arşivleniyor..."):(archived?"Arşivden Çıkar":"Lead’i Arşivle")}</button>;
}
