"use client";
import {useTransition} from "react";
import {setStudioProjectArchivedAction} from "@/app/studio/(protected)/projects/actions";
import {StudioPendingLabel,studioButtonClass} from "@/components/studio/StudioButton";
export default function StudioProjectArchiveControl({projectId,archived}:{projectId:string;archived:boolean}){
 const[pending,startTransition]=useTransition();
 function submit(){const message=archived?"Bu proje arşivden çıkarılacak. Devam etmek istiyor musunuz?":"Bu proje arşive taşınacak. Proje verileri silinmeyecek.";if(!window.confirm(message))return;startTransition(()=>setStudioProjectArchivedAction(projectId,!archived));}
 return <button type="button" onClick={submit} disabled={pending} aria-busy={pending} className={studioButtonClass("danger", "sm")}><StudioPendingLabel pending={pending} pendingLabel="İşleniyor...">{archived?"Arşivden Çıkar":"Projeyi Arşivle"}</StudioPendingLabel></button>;
}
