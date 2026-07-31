"use client";
import {useTransition} from "react";
import {setStudioQuoteArchivedAction} from "@/app/studio/(protected)/quotes/actions";
export default function StudioQuoteArchiveControl({quoteId,archived}:{quoteId:string;archived:boolean}){const[pending,startTransition]=useTransition();function run(){if(!window.confirm(archived?"Bu teklif arşivden çıkarılacak.":"Bu teklif arşive taşınacak. Veriler silinmeyecek."))return;startTransition(()=>setStudioQuoteArchivedAction(quoteId,!archived));}
 return <button type="button" disabled={pending} onClick={run} className="h-10 rounded-lg border border-[#d8c9c1] px-4 text-[10px] text-[#875d4d] disabled:opacity-50">{pending?(archived?"Arşivden Çıkarılıyor...":"Arşivleniyor..."):(archived?"Arşivden Çıkar":"Arşivle")}</button>;}
