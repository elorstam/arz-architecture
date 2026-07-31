"use client";
import {useTransition} from "react";
import {archiveFileAction} from "@/app/studio/(protected)/projects/[projectId]/files/actions";
import {studioButtonClass,StudioPendingLabel} from "@/components/studio/StudioButton";
export default function StudioFileArchiveControl({projectId,fileId,archived}:{projectId:string;fileId:string;archived:boolean}){const[pending,start]=useTransition();return <button type="button" disabled={pending} aria-busy={pending} onClick={()=>{if(window.confirm(archived?"Dosya arşivden çıkarılsın mı?":"Dosya arşivlensin mi? Storage nesnesi silinmez."))start(()=>archiveFileAction(projectId,fileId,!archived));}} className={studioButtonClass("danger","sm")}><StudioPendingLabel pending={pending} pendingLabel="İşleniyor…">{archived?"Geri Yükle":"Arşivle"}</StudioPendingLabel></button>;}
