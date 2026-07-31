"use client";
import {useTransition} from "react";
import {setStudioProjectArchivedAction} from "@/app/studio/(protected)/projects/actions";
export default function StudioProjectArchiveControl({projectId,archived}:{projectId:string;archived:boolean}){
 const[pending,startTransition]=useTransition();
 function submit(){const message=archived?"Bu proje arşivden çıkarılacak. Devam etmek istiyor musunuz?":"Bu proje arşive taşınacak. Proje verileri silinmeyecek.";if(!window.confirm(message))return;startTransition(()=>setStudioProjectArchivedAction(projectId,!archived));}
 return <button type="button" onClick={submit} disabled={pending} className="h-10 rounded-lg border border-[#d8c9c1] px-4 text-[10px] font-medium text-[#875d4d] outline-none hover:bg-[#f8f1ee] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#9e8452]/30">{pending?"İşleniyor...":archived?"Arşivden Çıkar":"Projeyi Arşivle"}</button>;
}
