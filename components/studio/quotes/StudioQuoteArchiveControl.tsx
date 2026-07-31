"use client";
import {useTransition} from "react";
import {setStudioQuoteArchivedAction} from "@/app/studio/(protected)/quotes/actions";
import {StudioPendingLabel,studioButtonClass} from "@/components/studio/StudioButton";
export default function StudioQuoteArchiveControl({quoteId,archived}:{quoteId:string;archived:boolean}){const[pending,startTransition]=useTransition();function run(){if(!window.confirm(archived?"Bu teklif arşivden çıkarılacak.":"Bu teklif arşive taşınacak. Veriler silinmeyecek."))return;startTransition(()=>setStudioQuoteArchivedAction(quoteId,!archived));}
 return <button type="button" disabled={pending} aria-busy={pending} onClick={run} className={studioButtonClass("danger", "sm")}><StudioPendingLabel pending={pending} pendingLabel={archived?"Arşivden Çıkarılıyor...":"Arşivleniyor..."}>{archived?"Arşivden Çıkar":"Arşivle"}</StudioPendingLabel></button>;}
