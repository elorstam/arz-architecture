"use client";
import {useTransition} from "react";
import {setStudioLeadArchivedAction} from "@/app/studio/(protected)/crm/actions";
import {StudioPendingLabel,studioButtonClass} from "@/components/studio/StudioButton";
export default function StudioLeadArchiveControl({leadId,archived}:{leadId:string;archived:boolean}){
 const[pending,startTransition]=useTransition();function submit(){const message=archived?"Bu CRM kaydı arşivden çıkarılacak. Devam etmek istiyor musunuz?":"Bu CRM kaydı arşive taşınacak. Lead verileri silinmeyecek.";if(!window.confirm(message))return;startTransition(()=>setStudioLeadArchivedAction(leadId,!archived));}
 return <button type="button" onClick={submit} disabled={pending} aria-busy={pending} className={studioButtonClass("danger", "sm")}><StudioPendingLabel pending={pending} pendingLabel={archived?"Arşivden Çıkarılıyor...":"Arşivleniyor..."}>{archived?"Arşivden Çıkar":"Lead’i Arşivle"}</StudioPendingLabel></button>;
}
